import mysql from "mysql";

// var config = {
//   host: "sql8.freemysqlhosting.net",
//   user: "sql8581012",
//   password: "K55WARXsWg",
//   database: "sql8581012",
// };

var config = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "busshuttle",
};

var connection = mysql.createConnection(config); //added the line
connection.connect(function (err) {
  if (err) {
    console.error("Error connecting:" + err.stack);
  }
  console.log("Connected successfully to DB.");
});

export default function createConnection() {
  return mysql.createConnection(config);
}
