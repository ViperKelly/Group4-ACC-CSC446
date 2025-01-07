var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "no-cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try{
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({username,password})
        })
        .then(res => res.json)
        .then(data => {
            if(data = "Success") {
                window.location.href = "totp.html";
            } else {
                console.log("Access denied");
            }
        })
        .catch(err => {
            console.error(err);
        });
    } catch (error) {
        console.log(error);
    }
}

async function totpSubmit() {
    const tokenInput = document.getElementById("totpToken").value;

    try{
        const response = await fetch("/totp2", {
            method: "POST",
            headers: {" Content-Type": "application/json" },
            body: JSON.stringify({tokenInput})
        })
        .then(res => res.json)
        .then(data => {
            if (data = "Success") {
                window.location.href = "query.html";
            } else {
                console.log(data);
            }
        })
        .catch(err => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
}