const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


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
app.use(cors());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "mydata"
});


app.use("/", express.static("frontend-website"));

app.post("/queryThings", function (request, response) {
  //get token from body
  let inToken = request.body.token;
  if(!inToken) {
    return response.send(JSON.stringify({response: "no authorization token"}));
  }
  console.log("have a token? ", inToken);
  console.log("fetching from the fetch...");

  let authorized = "invalid";
  fetch("http://server-users:3000/validateToken", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({token: inToken})
  })
  .then(res => res.json())
  .then(data => {
      console.log("data returned: ", data);
      authorized = data.response
      console.log('authorized after fetch: ', authorized);
      //send token to users server for verification
      //if not successful: send 401 / "token invalid"
      //if successful and admin:
      //let SQL = "SELECT * FROM things;";
      //if successful and not admin:
      let SQL = "SELECT * FROM things WHERE username=" + JWTReturn["username"] + ";";
      if(data.response === "valid"){
        connection.query(SQL, [true], (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return response.status(500).send(JSON.stringify({response: "database error"}));
          } else {
            console.log(results);
            return response.send(JSON.stringify({response: results}));
          }
        });
      } else {
        return response.send(JSON.stringify({response: "Not Authorized"}));
      }
  })
  .catch((err) => {
      console.log(err);
      return;
  })
});

//Different table query? Need to find out
app.post("/queryNotThings", function (request, response) {
  //get token from body
  let inToken = request.body.token;
  if(!inToken) {
    return response.send(JSON.stringify({response: "no authorization token"}));
  }
  console.log("have a token? ", inToken);
  console.log("fetching from the fetch...");

  let authorized = "invalid";
  fetch("http://server-users:3000/validateToken", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({token: inToken})
  })
  .then(res => res.json())
  .then(data => {
      console.log("data returned: ", data);
      authorized = data.response
      console.log('authorized after fetch: ', authorized);
      //send token to users server for verification
      //if not successful: send 401 / "token invalid"
      //if successful and not authorized: send 401
      //if successful and authorized:
      //let SQL = "SELECT * FROM things;";
      
      let SQL = "SELECT * FROM things WHERE username=" + JWTReturn["username"] + ";";
      if(data.response === "valid"){
        connection.query(SQL, [true], (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return response.status(500).send(JSON.stringify({response: "database error"}));
          } else {
            console.log(results);
            return response.send(JSON.stringify({response: results}));
          }
        });
      } else {
        return response.send(JSON.stringify({response: "Not Authorized"}));
      }
  })
  .catch((err) => {
      console.log(err);
      return;
  })
});

//Different table query? Need to find out
app.post("/queryUsers", function (request, response) {
  //get token from body
  let inToken = request.body.token;
  if(!inToken) {
    return response.send(JSON.stringify({response: "no authorization token"}));
  }
  console.log("have a token? ", inToken);
  console.log("fetching from the fetch...");

  let authorized = "invalid";
  fetch("http://server-users:3000/validateToken", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({token: inToken})
  })
  .then(res => res.json())
  .then(data => {
      console.log("data returned: ", data);
      authorized = data.response
      console.log('authorized after fetch: ', authorized);
      //send token to users server for verification
      //if not successful: send 401 / "token invalid"
      //if successful and not authorized: send 401
      //if successful and authorized:
      //let SQL = "SELECT * FROM things;";
  })
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
