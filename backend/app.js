const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const disasterRoutes = require("./routes/disasterRoutes");
const authRoutes = require("./routes/authRoutes");
const airRoutes = require("./routes/airRoutes");
const nearbyRoutes = require("./routes/nearbyRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("ResQAI Server is Running"));
app.get("/api", (req, res) => res.json({ status: "ok", service: "ResQAI API" }));

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({ message: "Database is temporarily unavailable. Please try again shortly." });
}

app.use(["/api/disasters", "/api/auth"], requireDatabase);
app.use("/api/disasters", disasterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/air", airRoutes);
app.use("/api/nearby", nearbyRoutes);

const mongoUri = process.env.MONGO_URI;
if (mongoUri && mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUri).then(() => console.log("MongoDB connected")).catch((error) => console.error("MongoDB connection error:", error.message));
}

module.exports = app;
