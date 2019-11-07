const Koa = require('koa2')
const app = new Koa()
var mysql = require('mysql2/promise');
let dbKey = {
	host: "127.0.0.1",
	user: "root",
	password: "root",
	database: "mydb"
}
// 2.1) Добавляет записи в субд
// 2.2) Отдает. Сделать возможность сортировки|фильтрация по всем возможным полям, возможность 
//порционного получения с оффсетом
// 2.3) Изменяет 

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


	if (method == 'GET') {
		let sqlRq = 'SELECT * FROM customers'
		let answer, gh, connection, sort

		if (resourceId == 'za') sort = ' DESC'
		else sort = ' ASC'

		if (resource == 'title' || resource == 'date' || resource == 'author') {
			sqlRq += ' ORDER BY ' + resource + sort
			if (alias != undefined) {
				alias = alias.split('=')
				if (alias[0] == 'lim' && alias[1]) {
					alias[1] = alias[1].split('&')
					if (alias[1][1]) {
						sqlRq += ' LIMIT ' + alias[1][0] + ', ' + alias[1][1]
					} else {
						sqlRq += ' LIMIT ' + alias[1]
					}
				}
			}
			statusCode = 201
		} else
			statusCode = 200

		console.log(sqlRq)
		connection = await mysql.createConnection(dbKey);
		[answer, gh] = await connection.execute(sqlRq)
		ctx.body = {
			code: statusCode,
			data: answer
		};
		//qeryBody = await DBcall("SELECT * FROM customers LIMIT 10").then(console.log(qeryBody))
	}
	//http://localhost:8080/POST/titleOne&authorOne&descriptionOne&2020&imageOne
	else if (method == 'POST') {
		let answer, gh, connection
		if (resource) {
			resourceArr = resource.split('&')
			console.log(resourceArr)
			var sqlRq = "INSERT INTO customers (title, author, description, date, image) VALUES ('"
				+ resourceArr[0] + "', '"
				+ resourceArr[1] + "', '"
				+ resourceArr[2] + "', '"
				+ resourceArr[3] + "', '"
				+ resourceArr[4] + "')"

			console.log(sqlRq)
			statusCode = 201
			connection = await mysql.createConnection(dbKey);
			[answer, gh] = await connection.execute(sqlRq)
			console.log(answer)
		} else {
			statusCode = 404
			answer = {}
		}
		ctx.body = {
			code: statusCode,
			data: answer
		};
	}
	//http://localhost:8080/PUT/title/title0/aaa
	else if (method == 'PUT') {
		let sqlRq = `UPDATE customers SET ${resource} = '${resourceId}' WHERE ${resource} = '${alias}';`
		console.log(sqlRq)
		connection = await mysql.createConnection(dbKey);
		[answ, gh] = await connection.execute('SET SQL_SAFE_UPDATES=0;');
		[answer, gh] = await connection.execute(sqlRq);
		[answ, gh] = await connection.execute('SET SQL_SAFE_UPDATES=1;');
		statusCode = 200
		ctx.body = {
			code: statusCode,
			data: answer
		};
	}
})


app.listen(8080)

// USE mydb;



// UPDATE customers
//  SET title = 'aaa'
//  WHERE title = 'title0';