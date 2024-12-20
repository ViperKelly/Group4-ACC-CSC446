async function login(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try{
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({username,password}),
        })
        .then(res => res.json)
        .then(data => {
            if(data = "Success") {
                window.location.href = "query.html";
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