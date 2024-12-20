const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM users;"

const PEPPER = "aae2";

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});

//HELPER FUNCTIONS
async function hashedPass(){
  const saltrounds = 10;
  const salt = await bcrypt.genSalt(saltrounds);
  const hashedPass = await bcrypt.hash()
}


app.use("/", express.static("frontend"));

app.get("/query", function (request, response) {
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})

app.post("/login", function (req, res) {
  let inUName = req.body.username;
  let inPass = req.body.password;

  SQL = "SELECT * FROM users WHERE username=?";
  connection.query(SQL, [inUName], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      let testPass = results[0][salt]+inPass+PEPPER;
      let passMatched = bcrypt.compare(testPass, results[0][password]);
      if (passMatched) {
        response.status(200).send("Success");
      } else {
        response.status(401).send("User not authorized.");
      }
    }
  })
})


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
