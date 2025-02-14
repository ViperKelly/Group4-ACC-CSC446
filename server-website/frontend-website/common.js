var parsedUrl = new URL(window.location.href);
let thisUser = "";

// Find the role of user from token as well as the users authentication
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

// function to fetch the log page and route
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
        
    })
}

// decode token
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

const token = getTokenFromCookie();
const decodedToken = decodeJWT(token);
console.log("Decoded Token:", decodedToken);  // Should include { username: "user", role: "admin" }

// Updated query button click handler to call the correct functions
function handleQueryButtonClick(type) {
    const token = getTokenFromCookie();
    if (!token) {
        alert("You need to be logged in.");
        return;
    }

    if (type === 'admin') {
        queryUserActivities(token);
    } else if (type === 'user') {
        queryData(token);
    }
}

// Handle if user is admin to access Logs
function handleLogsButtonClick() {
    const token = getTokenFromCookie();
    if (!token) {
        alert("You need to be logged in.");
        return;
    }
    const decoded = decodeJWT(token);
    if (decoded && decoded.role && decoded.role.toLowerCase() === "admin") {
        window.location.href = 'logs.html';
    } else {
        alert("Access Denied: Admin Credentials Required");
    }
}

// if admin allow for Admin query
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
            });
        } else {
            displayBox.value = 'No admin data found.';  // Set this to display in textarea if no data
        }
    })
    .catch(err => console.error("Error fetching admin data:", err));
}

// Query function for all users to see the data table
function queryData(token) {
    fetch("/queryData", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Data:", data.response);
        const displayBox = document.getElementById("response");
        displayBox.value = '';  
        if (Array.isArray(data.response) && data.response.length > 0) {
            data.response.forEach(item => {
                
                displayBox.value += `Brand: ${item.brand}, Model: ${item.model}, Year: ${item.year}, Top Speed: ${item.top_speed} mph, Horsepower: ${item.horsepower} hp, 0-60: ${item.zero_to_sixty} seconds\n`;
            });
        } else {
            displayBox.value = 'No data found.';
        }
    })
    .catch(err => console.error("Error fetching data:", err));
}

// Query User Activities (admin only)
function queryUserActivities(token) {
    const decoded = decodeJWT(token);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
        alert("Access Denied: Admin Credentials Required.");
        return;
    }
    
    fetch("/queryUserActivities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        console.log("User Activities:", data.response);
        const displayBox = document.getElementById("response");
        displayBox.value = '';  
        if (Array.isArray(data.response) && data.response.length > 0) {
            data.response.forEach(activity => {
                displayBox.value += `Activity: ${activity.activity}, Time: ${activity.activity_time}\n`;
            });
        } else {
            displayBox.value = 'No user activities found.';
        }
    })
    .catch(err => console.error("Error fetching user activities:", err));
}

// If user is a normal user handle normal queries
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
            });
        } else {
        displayBox.textContent = 'No activities found.';
        }
    })
    .catch(err => console.error("Error fetching user data:", err));
}

// take in the user inputs and use the login route to move to token
function login() {
    console.log("getting inputs...");
    const username = document.getElementById("username").value;
    thisUser = username;  
    console.log("Username set to:", thisUser);
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        body: JSON.stringify({ username: username, password: password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.response == "Success") {
            localStorage.setItem("username", thisUser);  // Store username in localStorage
            window.location.href = "race.html";
        } else {
            console.log(data.response);
        }
    })
    .catch(err => {
        console.error("Login failed:", err);
    }); 
}

// Take user input token and check using totpSubmit route and send to query page
function totpSubmit() {
    console.log("submitting token...");
    const tokenInput = document.getElementById("totpToken").value;
    const phrase = document.getElementById("something").value;
    const username = localStorage.getItem("username");  // Retrieve the username from localStorage
    console.log("Username being sent in TOTP:", username);  // Log the username

    let token = getTokenFromCookie();  // Retrieve the token from cookies
    console.log("Sending token:", token);

    fetch("http://localhost:3000/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenInput: tokenInput, phrase: phrase, username: username, token: token })  // Pass the username and token
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

// Register a new user by taking input and calling the registration route
function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
    })
    .then(response => {
        if(response.ok) {
            alert('Registration successful');
            window.location.href = 'index.html';
        } else {
            alert('Registration failed');
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    });
}

// Take the user's token to check for admin and send to logs to allow query of logs
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