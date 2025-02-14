const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fetch = require("node-fetch");

const jwt = require("jsonwebtoken");

const JWTSECRET = String(process.env.JWTSECRET);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const MYSQLHOST = process.env.MYSQLHOST || "localhost";
const MYSQLUSER = process.env.MYSQLUSER || "root";
const MYSQLPASS = process.env.MYSQLPASS || "";
const PEPPER = "aae2";
const TOTP2SECRET = "hashpartfront";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "mydata"
});

// Function to validate and parse token
function validateAndParseToken(token) {
  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
  } catch (err) {
      console.error("Invalid token:", err.message);
      return null;
  }
}


// Routes
app.use("/", express.static("frontend-website"));

app.post("/queryUsers", async function (req, res) {
  const token = req.body.token;
    jwt.verify(token, JWTSECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ response: "Invalid token" });
        }

        // Check if the user has the admin role
        if (decoded.role !== "admin" && decoded.role !== "user") {
            return res.status(403).send({ response: "Not Authorized" });
        }

        const SQL = "SELECT * FROM user_activities";
        connection.query(SQL, (error, results) => {
            if (error) {
                return res.status(500).send({ response: "Database error" });
            }
            res.send({ response: results });
        });
    });
});

app.post("/validateToken", function (req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = validateAndParseToken(token);
  
  if (decoded) {
    const { username, role } = decoded;
    res.json({
      response: "valid",
      username: username,
      role: role // Add the role here
    });
  } else {
    res.json({ response: "invalid" });
  }
});

app.post("/queryAdminData", function (req, res) {
    const token = req.body.token;
    jwt.verify(token, JWTSECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ response: "Invalid token" });
        }

        // Check if the user has the admin role
        if (decoded.role !== "admin") {
            return res.status(403).send({ response: "Not Authorized" });
        }

        const SQL = "SELECT * FROM admin_data";
        connection.query(SQL, (error, results) => {
            if (error) {
                return res.status(500).send({ response: "Database error" });
            }
            res.send({ response: results });
        });
    });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});