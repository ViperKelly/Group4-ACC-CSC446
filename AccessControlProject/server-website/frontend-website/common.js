var parsedUrl = new URL(window.location.href);
let thisUser = "";


//HELPER FUNCTIONS

function getTokenFromCookie() {
    const cookies = document.cookie.split("; ");
    console.log(cookies);
    for (let cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === 'authToken') {
            console.log(value);
            return value;
        }
    }
    return null;
}

function log(username, description, success) {
    const user = decodeJWT(getTokenFromCookie()).username;
    const timeNow = new Date();
    let reqBody = {
        user: user,
        description: description,
        timestamp: timeNow,
        success: success
    }

    fetch("http://localhost:3000/log", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody)
    })
    .then((res) => res.json())
    .then((data) => {
        //console.log(data);
    })
}

function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

const token = getTokenFromCookie();
const decodedToken = decodeJWT(token);
console.log("Decoded Token:", decodedToken);  // Should include { username: "user", role: "admin" }

//WEBSITE FUNCTIONS

function handleQueryButtonClick(type) {
    let token = getTokenFromCookie();
    if (!token) {
        alert("You need to be logged in.");
        return;
    }

    if (type === 'admin') {
        queryAdminData(token);
    } else if (type === 'user') {
        queryUsers(token);
    }
}

function queryAdminData(token) {
    fetch("/queryAdminData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Admin Data:", data.response);
        const displayBox = document.getElementById("response");
        displayBox.value = '';  

        if (Array.isArray(data.response) && data.response.length > 0) {
            data.response.forEach(car => {
                displayBox.value += `Brand: ${car.brand}, Model: ${car.model}, Year: ${car.year}, Top Speed: ${car.top_speed} mph, Horsepower: ${car.horsepower} hp, 0-60: ${car.zero_to_sixty} seconds\n`;
                log(thisUser, "Admin Queried Data", "Success");
            });
        } else {
            displayBox.value = 'No admin data found.';  // Set this to display in textarea if no data
            log(thisUser, "Admin Queried Data", "Failure");
        }
    })
    .catch(err => console.error("Error fetching admin data:", err));
}
  
function queryUsers(token) {
    fetch("/queryUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        console.log("User Data:", data.response);
    const displayBox = document.getElementById("response");
    displayBox.innerHTML = '';

    if (Array.isArray(data.response) && data.response.length > 0) {
        data.response.forEach(activity => {
                displayBox.value += `Activity: ${activity.activity}, Time: ${activity.activitiy_time}\n`;
                log(thisUser, "User Queried Data", "Success");
            });
        } else {
            displayBox.textContent = 'No activities found.';
            log(thisUser, "User Queried Data", "Failure");
        }
    })
    .catch(err => console.error("Error fetching user data:", err));
}

function login() {
    console.log("getting inputs...");
    const username = document.getElementById("username").value;
    thisUser = username;  
    console.log("Username set to:", thisUser);
    const password = document.getElementById("password").value;

    fetch("http://127.0.0.1:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        body: JSON.stringify({ username: username, password: password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.response == "Success") {
            localStorage.setItem("username", thisUser);  // Store username in localStorage
            window.location.href = "totp.html";
        } else {
            console.log(data.response);
        }
    })
    .catch(err => {
        console.error("Login failed:", err);
    }); 
}

function totpSubmit() {
    console.log("submitting token...");
    const tokenInput = document.getElementById("totpToken").value;
    const username = localStorage.getItem("username");  // Retrieve the username from localStorage
    console.log("Username being sent in TOTP:", username);  // Log the username

    let token = getTokenFromCookie();  // Retrieve the token from cookies
    console.log("Sending token:", token);

    fetch("http://localhost:3000/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenInput: tokenInput, username: username, token: token })  // Pass the username and token
    })
    .then(res => res.json())
    .then(data => {
        console.log("Response received:", data);
        if (data.response == "Success") {
            document.cookie = `authToken=${data.token}; path=/;`;
            window.location.href = "query.html";
        } else {
            console.log(data.response);
        }
    })
    .catch(err => console.log(err));
}

function queryLogs() {
    console.log("Got to queryLogs function!");
    const decodedToken = decodeJWT(getTokenFromCookie());
    console.log(decodedToken);
    let username = thisUser;
    let userRole = decodedToken.role;
    console.log(userRole);

    if (!decodedToken) {
        console.error("Invalid Token")
        log(username, "Queried Logs", "Failure"); 
        return;
    }

    console.log("fetching now...");
    fetch("http://localhost:3000/queryLogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRole: userRole}),
        mode: "cors"
    }).then(res => {
        if (!res.ok) {
            log(username, "Queried Logs:", "Failure"); 
            throw new Error(data.status);
        }else{
            console.log("response ok'd! parsing...");
            log(username, "Queried Logs:", "Success"); 
            return res.json();
        }
    }).then(data => {
        console.log("Dissecting data...");
        const logsDiv = document.getElementById('queriedLogs');
        logsDiv.value = '';

        data.forEach(returnedLogs => {
            /*
            const entry = document.createElement('div');
            entry.classList.add('log-entry');

            if (returnedLogs.success === "Success") {
                entry.style.backgroundColor = "green";
            } else {
                entry.style.backgroundColor = "red";
            }
            */

            const entry = `ID: ${returnedLogs.log_id} User: ${returnedLogs.log_user} Action: ${returnedLogs.log_description} Timestamp: ${returnedLogs.log_timestamp} Attempt: ${returnedLogs.log_success} \n`;

            logsDiv.value += entry + "\n";
            console.log("New entry: ", entry);
        });
        console.log(logsDiv);

    }).catch((err) => {
        console.log(err);
        log(username, "Queried Logs", "Failure"); 
    })
}
