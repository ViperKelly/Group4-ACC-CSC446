const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM users;"

const PEPPER = "aae2";
const TOTP2SECRET = "hashpartfront";

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  const SQL = "SELECT * FROM users WHERE username=?";
  connection.query(SQL, [username], (error, results) => {
    if (error) {
      console.error(error.message);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = results[0];
    const testPass = user.salt + password + PEPPER;
    const passMatched = bcrypt.compareSync(testPass, user.password);

    if (passMatched) {
      res.status(200).send("Success");
    } else {
      res.status(401).send("User not authorized");
    }
  });
})


app.post("/totp2", function (req, res) {
  const date = new Date();

  const inToken = req.body.tokenInput;
  const timestamp = Math.floor(date.getTime() / 30000); // Rounds to nearest 30 seconds

  // Generate the hashed TOTP token
  let hashedStr = TOTP2SECRET + timestamp.toString();
  hashedStr = crypto.createHash('sha256').update(hashedStr).digest('hex');
  const generatedToken = hashedStr.replace(/\D/g, "").slice(0, 6);

  // Validate the input token
  if (inToken === generatedToken) {
    res.status(200).send("Success");
  } else {
    res.status(401).send("Token is invalid.");
  }
})



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
