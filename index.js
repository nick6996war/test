const Koa = require('koa2')
var mysql = require('mysql2/promise')

const app = new Koa()
// данные для подключения к БД
let dbKey = {
	host: "127.0.0.1",
	user: "root",
	password: "root",
	database: "mydb"
}
// используем один глобальный роутер 
app.use(async (ctx, next) => {
	console.log(ctx)
	// Предусматриваем четырехуровневый URL
	let method
	let resource
	let alias
	let resourceId

	let urlArr = await ctx.originalUrl.split('/')
	if (urlArr[1]) method = urlArr[1]
	if (urlArr[2]) resource = urlArr[2]
	if (urlArr[3]) alias = urlArr[3]
	if (urlArr[4]) resourceId = urlArr[4]
	// переменные для обработки ответа БД
	let answer
	let gh
	let connection
	let statusCode
	let sqlRq

	/*
	http://localhost:8080/GET/date/lim=1000/za
	Отдает возможность сортировки, возможность порционного получения с оффсетом
	http://localhost:8080/GET/resource/alias/resourceID
	resource название колонки по которой будем фильтровать
		принимает значения title date author
	alias порционное получение 'lim=нужное количество строк' 'lim=1000' 
		или 'lim=5,100' то есть с паятой по сотую
	resourceID в порядке возрастани или убывания 
		по умолчанию в порядке возростания для установки порядка убывания '/za/
	*/
	if (method == 'GET') {
		//так как всего одна таблица пишем сразу единый запрос
		sqlRq = 'SELECT * FROM customers'
		try {
			//если resourceId == 'za' сортируем список в порядке убывания
			//в противном случае сортировка по возростанию
			if (resourceId == 'za') sort = ' DESC'
			else sort = ' ASC'
		

			if (resource == 'title' || resource == 'date' || resource == 'author') {
				sqlRq += ' ORDER BY ' + resource + sort
				if (alias != undefined) {
					alias = alias.split('=')
					//если первая часть алиаса = lim  а вторая введена 
					if (alias[0] == 'lim' && alias[1]) {
						//для возможности получения строк с alias[1][0] по alias[1][1]
						alias[1] = alias[1].split('&')
						if (alias[1][1]) {
							sqlRq += ` LIMIT ${alias[1][0]} , ${alias[1][1]} `
						} else {
							sqlRq += ` LIMIT ${alias[1]} `
						}
					}
				}
				statusCode = 201
			} else
				statusCode = 200

			console.log(sqlRq)
			connection = await mysql.createConnection(dbKey);
			[answer, gh] = await connection.execute(sqlRq)
		} catch (e) {
			statusCode = 404
			answer = e
		}
		ctx.body = {
			code: statusCode,
			data: answer
		}
	}

	/*
	Добавляет записи в БД 
		http://localhost:8080/POST/resource
		все пишется в ресурс
		//http://localhost:8080/POST/titleOne&authorOne&descriptionOne&2020&imageOne
		согласно запроса INSERT INTO customers (title, author, description, date, image)
	*/
	else if (method == 'POST') {
		try {
			if (resource) {
				resourceArr = resource.split('&')
				console.log(resourceArr)
				sqlRq = `INSERT INTO customers (title, author, description, date, image) 
				VALUES (
				'${resourceArr[0]}',
				'${resourceArr[1]}',
				'${resourceArr[2]}',
				'${resourceArr[3]}',
				'${resourceArr[4]}')`

				console.log(sqlRq)
				statusCode = 201
				connection = await mysql.createConnection(dbKey);
				[answer, gh] = await connection.execute(sqlRq)
				console.log(answer)
			}
		} catch (e) {
			statusCode = 404
			answer = e
		}
		ctx.body = {
			code: statusCode,
			data: answer
		}
	}

	/*
	http://localhost:8080/PUT/title/title0/aaa
	Изменяет записи по принципу  localhost:8080/PUT/имя столбца/старое значение/новое значение
	*/
	else if (method == 'PUT') {
		try {
			sqlRq = `UPDATE customers SET ${resource} = '${resourceId}' 
				WHERE ${resource} = '${alias}';`
			console.log(sqlRq)
			connection = await mysql.createConnection(dbKey);
			//включаем разрешение изменения записей 
			[answ, gh] = await connection.execute('SET SQL_SAFE_UPDATES=0;');
			[answer, gh] = await connection.execute(sqlRq);
			//отключаем разрешение изменения записей 
			[answ, gh] = await connection.execute('SET SQL_SAFE_UPDATES=1;')
			statusCode = 201
		} catch (e) {
			statusCode = 400
			answer = e
		}
		ctx.body = {
			code: statusCode,
			data: answer
		}
	}

	/**
	Удаляет записи по принципу http://localhost:8080/DELETE/имя столбца/значение
	*/
	else if (method == 'DELETE') {
		try {
			let sqlRq = `DELETE FROM customers WHERE ${resource} = '${alias}'`
			console.log(sqlRq)

			connection = await mysql.createConnection(dbKey);
			[answer, gh] = await connection.execute(sqlRq);
			if (answer.affectedRows > 0) statusCode = 304
			else statusCode = 301

			console.log(answer, gh)
		} catch (e) {
			statusCode = 404
			answer = e
		} ctx.body = {
			code: statusCode,
			data: answer
		}
	}
	//если ни один из запросов не совпал даем ссылку на доки
	else{
		ctx.body = {
			code:400,
			data: 'https://github.com/nick6996war/test'
		}
	}
})


app.listen(8080)