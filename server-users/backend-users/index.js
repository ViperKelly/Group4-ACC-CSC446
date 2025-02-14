
// PACKAGES
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

// VARIABLES
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const JWTSECRET = String(process.env.JWTSECRET);
const PEPPER = String(process.env.PEPPER);
const TOTP2SECRET = String(process.env.TOTP2SECRET);
const SQL = "SELECT * FROM users;"

// Establish the app and enable requests
const app = express();
app.use(express.json());
app.use(cors());

let userToken = "";

// Users database connection
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});

// Login route handler
app.post("/login", function (req, res) {

  // variables containing the information a user provided
  let inUName = req.body.username.trim();
  let inPass = req.body.password;

  // First, check for the user in the database
  let mySQL = "SELECT * FROM users WHERE username = ?;";
  connection.query(mySQL, [inUName], async (error, results) => {
    if (error) {
      return res.status(500).send({ response: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).send({ response: "User not found." });
    }

    // Verify Password
    let testPass = results[0]['salt'] + inPass + PEPPER;
    let passMatched = await bcrypt.compare(testPass, results[0]['password']);
    
    if (!passMatched) {
      return res.status(401).send({ response: "Invalid credentials" });
    }
    
    const userData = {
      username: inUName,
      role: results[0].role
    };
    // Once verified create a cookie token to keep them logged in and store what role they are
    const token = jwt.sign(userData, JWTSECRET, { expiresIn: "1h" });
    
    res.send({ response: "Success", token: token });
  });
});

// TOTP Token Route Handler
app.post("/totp", function (req, res) {

  // User given token
  let inUName = req.body.username.trim();

    // Query the database for the user's role 
    let mySQL = "SELECT role FROM users WHERE username = ?;";
    connection.query(mySQL, [inUName], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).send({ response: "Database error or user not found." });
        }

        // Check if the provided phrase is exactly "race"
      if (req.body.phrase !== "race") {
        return res.send({ response: "Invalid something provided." });
    }
        // Create the check Token
        const date = new Date();
        let timestamp = Math.round(date.getTime() / 60000) * 60000;
        let hashedStr = TOTP2SECRET + timestamp;
        hashedStr = crypto.createHash('sha256').update(hashedStr).digest('hex');
        hashedStr = hashedStr.slice(0, 6);

        // Same as login have a token for the user that states their role
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

// Validate the user's token
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

// Log Route Handler
app.post("/log", (req, res) => {
  // Extract log information from the request body
  const user = req.body.user;
  const timestamp = req.body.timestamp;
  const description = req.body.description;
  const success = req.body.success;

  // Create a uuid using uuidv4
  const uuid = uuidv4();

  // Insert the log entry into the logs table
  const query = "INSERT INTO logs VALUES(?, ?, ?, ?, ?)";
  connection.query(query, [uuid, user, timestamp, description, success], (error, results, fields) => {
      if (error) {
          console.error("Unexpected Logging Error: ", error.message);
          res.status(500).send("Server Error");
      } else {
          res.status(200).json("Success");
      }
  });
});

// Query the Logs Route Handler
app.post("/queryLogs", function (req, res) {
  const userRole = req.body.userRole;
  const allowedRoles = ['admin'];

  if (allowedRoles.includes(userRole)) {
      const query = "SELECT * FROM logs";
      connection.query(query, (error, results, fields) => {
          if (error) {
              return res.status(500).send("Database error");
          } else {
              return res.status(200).json(results);
          }
      });
  } else {
      return res.status(401).send("Access Denied");
  }
});

// Register Route Handler
app.post("/register", (req, res) => {
  // Take in the information the user provided
    const { username, password, email } = req.body;
  
    // Check if User already exists
    const checkQuery = "SELECT username FROM users WHERE username = ?";
    connection.query(checkQuery, [username], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for existing user:", checkErr);
        return res.status(500).json({ error: "Database error" });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }
  
      // Generate the salt
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
