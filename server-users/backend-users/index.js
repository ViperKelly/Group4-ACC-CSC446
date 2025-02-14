const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');


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

// Middleware to require Admin access using JWT token
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }
    jwt.verify(token, JWTSECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (decoded.role !== "Admin") {
        return res.status(403).json({ error: "Access Denied: Admins only" });
      }
      req.user = decoded;
      next();
    });
  }
  
  // Route to insert logs
  app.post("/logs", (req, res) => {
    const { who, when, what, success } = req.body;
    const id = uuidv4();
    const insertQuery = "INSERT INTO logs (id, username, log_time, data_access, success) VALUES (?, ?, ?, ?, ?)";
    connection.query(insertQuery, [id, who, when, what, success], (err, results) => {
      if (err) {
        console.error("Error inserting log:", err);
        return res.status(500).json({ error: "Failed to insert log" });
      }
      res.status(201).json({ id, who, when, what, success });
    });
  });
  
  // Route to retrieve logs (Admin only) with logging of access
  app.get("/logs", requireAdmin, (req, res) => {
    const idLog = uuidv4();
    const insertLogQuery = "INSERT INTO logs (id, username, log_time, data_access, success) VALUES (?, ?, NOW(), ?, ?)";
    connection.query(insertLogQuery, [idLog, req.user.username, "access_logs_route", true], (err, result) => {
      if (err) {
        console.error("Error logging logs access:", err);
        // Proceed to retrieve logs even if logging fails
      }
      connection.query("SELECT * FROM logs ORDER BY log_time DESC", (err, rows) => {
        if (err) {
          console.error("Error retrieving logs:", err);
          return res.status(500).json({ error: "Failed to retrieve logs" });
        }
        res.json(rows);
      });
    });
  });

app.post("/register", (req, res) => {
    const { username, password, email } = req.body;
  
    // First, check if the username already exists
    const checkQuery = "SELECT username FROM users WHERE username = ?";
    connection.query(checkQuery, [username], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for existing user:", checkErr);
        return res.status(500).json({ error: "Database error" });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }
  
      // Generate a 4-character salt (using 2 random bytes converted to hex)
      const saltStr = crypto.randomBytes(2).toString("hex");
  
      // Hash the password concatenated with salt and PEPPER
      bcrypt.hash(saltStr + password + PEPPER, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error("Error hashing password:", hashErr);
          return res.status(500).json({ error: "Error processing registration" });
        }
  
        // Insert the new user with the default role 'user'
        const insertQuery = "INSERT INTO users (username, salt, password, email) VALUES (?, ?, ?, ?)";
        connection.query(insertQuery, [username, saltStr, hashedPassword, email], (insertErr) => {
          if (insertErr) {
            console.error("Error inserting new user:", insertErr);
            return res.status(500).json({ error: "Failed to register user" });
          }
          res.status(201).json({ response: "User registered successfully" });
        });
      });
    });
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
