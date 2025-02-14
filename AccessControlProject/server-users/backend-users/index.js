const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v1: uuidv1 } = require('uuid');
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
    let inUName = req.body.username.trim();
    let inPass = req.body.password;

    let mySQL = "SELECT * FROM users WHERE username = ?;";
    connection.query(mySQL, [inUName], async (error, results) => {
        if (error) {
            return res.status(500).send("Database error");
        }

        if (results.length === 0) {
            return res.status(404).send({ response: "User not found." });
        }

        let testPass = await results[0]['salt'] + inPass + PEPPER;
        let passMatched = await bcrypt.compare(testPass, results[0]['password']);
        
        if (passMatched) {
            // Include role in the JWT token
            const userData = {
                username: inUName,
                role: results[0].role  // Add role to the JWT payload
            };

            const token = jwt.sign(userData, JWTSECRET, { expiresIn: '1h' });
            return res.send({ response: "Success", token: token });
        } else {
            return res.send({ response: "Invalid credentials" });
        }
    });
});

app.post("/totp", function (req, res) {
  let inUName = req.body.username.trim();

    // Query the database for the user's role (if not already available in the frontend)
    let mySQL = "SELECT role FROM users WHERE username = ?;";
    connection.query(mySQL, [inUName], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).send({ response: "Database error or user not found." });
        }

        const date = new Date();
        let timestamp = Math.round(date.getTime() / 60000) * 60000;
        let hashedStr = TOTP2SECRET + timestamp;
        hashedStr = crypto.createHash('sha256').update(hashedStr).digest('hex');
        hashedStr = hashedStr.slice(0, 6);

        if (req.body.tokenInput === hashedStr) {
            // Include role in the JWT token
            const userData = {
                username: inUName,
                role: results[0].role  // Add role to the JWT payload
            };

            const token = jwt.sign(userData, JWTSECRET, { expiresIn: '1h' });
            return res.send({ token: token, response: "Success" });
        } else {
            return res.send({ response: "Token is invalid." });
        }
    });
});

app.post("/validateToken", function (req, res) {
  const token = req.body.token;
  jwt.verify(token, JWTSECRET, (err, decoded) => {
      if (err) {
          return res.status(500).send({ response: "Server error" });
      }
      const { username, role } = decoded;
      res.json({ response: "valid", username, role });
  });
});

app.post("/log", (req, res) => {
    let user = req.body.user;
    let timestamp = req.body.timestamp;
    let description = req.body.description;
    let success = req.body.success;
  
    const uuid = uuidv1();
    //console.log(uuid);
  
    let query = "INSERT INTO logs VALUES('" + uuid +"', '" + user + "', '" + timestamp + "', '" + description + "', '" + success + "');";

    connection.query(query, [true], (error, results, fields) => {
        if (error) {
          console.error("Unexpected Logging Error: \n", error.message);
          res.status(500).send("Server Error");
        }
        else {
          res.status(200).json("Success");
        }
    });
});

app.post("/queryLogs", function (req, res) {
    console.log("Got to queryLogs endpoint!");
    const body = req.body;
    console.log(body);
    const userRole = req.body.userRole;
    let allowedRoles = ['admin'];
  
    let query = "SELECT * FROM logs";
  
    if (allowedRoles.includes(userRole)) {
        console.log("User is an admin!");
        connection.query(query, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("database error");
        } else {
            console.log("Log results: ", results);
            return res.status(200).json(results);
        }
      });
    } else {
        console.log("User not an admin!");
        return res.status(401).send("Access Denied");
    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
