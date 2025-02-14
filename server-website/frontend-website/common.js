var parsedUrl = new URL(window.location.href);
let thisUser = "";

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

function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

const token = getTokenFromCookie();
const decodedToken = decodeJWT(token);
console.log("Decoded Token:", decodedToken);  // Should include { username: "user", role: "admin" }

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
            });
        } else {
            displayBox.value = 'No admin data found.';  // Set this to display in textarea if no data
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
            });
        } else {
        displayBox.textContent = 'No activities found.';
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
