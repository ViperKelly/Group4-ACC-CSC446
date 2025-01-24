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

function queryThings() {
    const mytoken = getTokenFromCookie();
    console.log("Inside query function: ", mytoken);
    console.log(parsedUrl.host);
    if (!mytoken) {
        console.error('Token not found');
        return;
    }
    //get token from cookie
    const response = fetch("http://" + parsedUrl.host + "/queryThings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        body: JSON.stringify({token: mytoken})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.response);
        document.getElementById("response").innerHTML = data.response;
    })
    .catch((err) => {
        console.log(err);
    })
}

function queryNotThings() {
    const mytoken = getTokenFromCookie();
    console.log("Inside query function: ", mytoken);
    console.log(parsedUrl.host);
    if (!mytoken) {
        console.error('Token not found');
        return;
    }
    //get token from cookie
    const response = fetch("http://" + parsedUrl.host + "/queryNotThings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        body: JSON.stringify({token: mytoken})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.response);
        document.getElementById("response").innerHTML = data.response;
    })
    .catch((err) => {
        console.log(err);
    })
}

function login() {
    console.log("getting inputs...");
    const username = document.getElementById("username").value;
    thisUser = username;
    const password = document.getElementById("password").value;

    try{
        console.log("starting fetch...");
        const response = fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: 'cors',
            body: JSON.stringify({username: username,password: password})
        })
        .then(res => res.json())
        .then(data => {
            console.log("got to data return");
            if(data.response == "Success") {
                console.log("response was success. redirecting...");
                window.location.href = "totp.html";
            } else {
                console.log(data.response);
            }
        })
        .catch(err => {
            console.error(err);
        });
    } catch (error) {
        console.log(error);
    }
}

function totpSubmit() {
    console.log("submitting token...");
    const tokenInput = document.getElementById("totpToken").value;

    try{
        console.log('attempting fetch...');
        const response = fetch("http://localhost:3000/totp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: 'cors',
            body: JSON.stringify({tokenInput: tokenInput, username: thisUser})
        })
        .then(res => res.json())
        .then(data => {
            console.log("response received!");
            console.log(data.token);
            document.cookie = `authToken=${data.token}; path=/;`;
            if (data.response == "Success") {
                window.location.href = "query.html";
            } else {
                console.log(data.response);
            }
        })
        .catch(err => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
}