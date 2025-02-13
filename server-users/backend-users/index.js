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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
