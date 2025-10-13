let mysql = require('mysql');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3307 // Default MySQL port
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb1", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});