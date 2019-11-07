var mysql = require('mysql');

  con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "mydb"
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    for (let i = 50000; i <= 1e5; i++) {

    let year = Math.floor(Math.random() * 1020) + 1000
    var sql = "INSERT INTO customers (title, author,description,date,image) VALUES ('title" + i + "', 'author" + i + "', 'description" + i + "','" + year + "', 'image" + i + "')"
    //var sql = "CREATE TABLE customers (title VARCHAR(35), author VARCHAR(35), description TEXT(35), date VARCHAR(4),image VARCHAR(35) )"
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    })
  } })

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");

  //   var sql = "INSERT INTO customers (title, author,description,date,image) VALUES ('title"+i+"', 'author"+i+",' 'description"+i+","+Date+" 'image"+i+"')";
  //   con.query(sql, function (err, result) {
  //     if (err) throw err;
  //     console.log("1 record inserted");
  //   });
  // });