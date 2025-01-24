const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cors = require("cors");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const JWTSECRET = String(process.env.JWTSECRET);
const PEPPER = String(process.env.PEPPER);
const TOTP2SECRET = String(process.env.TOTP2SECRET);
const SQL = "SELECT * FROM users;"

const app = express();
app.use(express.json());
app.use(cors());

let userToken = "";


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.post("/login", function (req, res) {
  let inUName = req.body.username;
  let inPass = req.body.password;

  mySQL = "SELECT * FROM users WHERE username='" + inUName + "';";
  connection.query(mySQL, [inUName], async (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results[0]['salt']);
      let testPass = await results[0]['salt']+inPass+PEPPER;
      let passMatched = bcrypt.compare(testPass, results[0]['password']);
      if (passMatched) {
        console.log("passwords matched.")
        return res.send(JSON.stringify({response: "Success"}));
      } else {
        return res.send(JSON.stringify({response: "User not authorized."}));
      }
    }
  })
});

app.post("/totp", function (req, res) {
  console.log("received totp request...");
  const date = new Date();

  let inToken = req.body.tokenInput;
  let inUName = req.body.username;
  let timestamp = Math.round(date.getTime() / 60000) * 60000;

  let hashedStr = TOTP2SECRET + timestamp;
  hashedStr = crypto.createHash('sha256').update(hashedStr).digest('hex');
  hashedStr = hashedStr.slice(0, 6);
  console.log("hashed:", hashedStr, " Inputted:", inToken);
  console.log(hashedStr);
  console.log(inToken);

  if (inToken == hashedStr) {
    console.log("Comparison is true!");
    let userData = mySQL = "SELECT * FROM users WHERE username='" + inUName + "';";
    let token = jwt.sign(userData, JWTSECRET);
    console.log("token: ", token);
    userToken = token;
    return res.status(200).send(JSON.stringify({token: token, response: "Success"})); //Change to send JWT (for verification)
  } else {
    console.log("Comparison is false!");
    return res.send(JSON.stringify({response: "Token is invalid."}));
  }
});

app.post("/validateToken", function (req, res) {
  //verify token is current and was made by this server
  let inToken = req.body.token;
  console.log("inside validateToken");
  console.log(inToken);
  jwt.verify(inToken, JWTSECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify: ', err.message);
      return res.status(500).send(JSON.stringify({response: "server error"}));
    } else {
      console.log("SUCCESS THANK GOD; ", decoded);
      return res.send(JSON.stringify({response: "valid"}));
    }
  })
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
