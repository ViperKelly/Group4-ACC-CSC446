const crypto = require("crypto");

const TOTP2SECRET = "hashpartfront";
const date = new Date();
let timestamp = Math.round(date.getTime() / 60000) * 60000;

let hashedStr = TOTP2SECRET + timestamp;
hashedStr = crypto.createHash('sha256').update(hashedStr).digest('hex');
hashedStr = hashedStr.slice(0, 6);

console.log(hashedStr);