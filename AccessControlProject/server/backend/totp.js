#!/usr/bin/env node

const crypto = require("crypto");

const TOTP2SECRET = "hashpartfront";

// Function to generate TOTP
function generateTOTP() {
  const date = new Date();

  // Calculate the timestamp rounded to the nearest 30 seconds
  const timestamp = Math.floor(date.getTime() / 30000);

  // Concatenate the secret with the timestamp
  let hashedStr = TOTP2SECRET + timestamp.toString();

  // Hash the result using SHA-256
  hashedStr = crypto.createHash("sha256").update(hashedStr).digest("hex");

  // Extract the first 6 numeric characters
  const totp = hashedStr.replace(/\D/g, "").slice(0, 6);

  // Ensure the TOTP is valid and 6 characters long
  if (totp.length < 6) {
    console.error("Error: Failed to generate a valid TOTP.");
    process.exit(1);
  }

  return totp;
}

// Execute the script
const totp = generateTOTP();
console.log(totp);
