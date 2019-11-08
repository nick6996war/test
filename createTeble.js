var mysql = require('mysql')

let con = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "root",
})

let sqlCR = `CREATE TABLE mydb.customers (
	title VARCHAR(35),
	author VARCHAR(35),
	description TEXT(35),
	date VARCHAR(4),
	image VARCHAR(35)
);`

con.connect(function (err) {
	if (err) throw err
	let liters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	con.query('CREATE DATABASE mydb;', function (err, result) {
		if (err) throw err
		console.log("Database created")
	})
	con.query(sqlCR, function (err, result) {
		if (err) throw err
		console.log("TABLE created")
	})
	for (let i = 0; i < 1e5; i++) {
		//для каждого поля своя переменая для получения даных длясортировки
		let ltt = liters[Math.floor(Math.random() * 26)]
		let lta = liters[Math.floor(Math.random() * 26)]
		let ltd = liters[Math.floor(Math.random() * 26)]
		let year = Math.floor(Math.random() * 1621) + 400
		let sql = `INSERT INTO mydb.customers (title, author,description,date,image)
			VALUES ('${ltt}title', '${lta}author', '${ltd}description','${year}', 'image${i+ltt+ltd+lta}')`
		con.query(sql, function (err, result) {
			if (err) throw err
			console.log(i)
		})

	} console.log("Database filled up")

})
