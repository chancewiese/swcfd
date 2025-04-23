// backend/test-connection.js
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
});
const mongoose = require("mongoose");

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection successful!");
    await mongoose.disconnect();
    console.log("Disconnected successfully");
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();
