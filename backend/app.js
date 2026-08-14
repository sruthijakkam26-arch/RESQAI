const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const disasterRoutes = require("./routes/disasterRoutes");
const authRoutes = require("./routes/authRoutes");
const airRoutes = require("./routes/airRoutes");
const nearbyRoutes = require("./routes/nearbyRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("ResQAI Server is Running"));
app.get("/api", (req, res) => res.json({ status: "ok", service: "ResQAI API" }));

const mongoUri = process.env.MONGO_URI;
let databaseConnection;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!mongoUri) return Promise.reject(new Error("MONGO_URI is not configured"));
  if (!databaseConnection) {
    databaseConnection = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then(() => console.log("MongoDB connected"))
      .catch((error) => {
        databaseConnection = null;
        throw error;
      });
  }
  return databaseConnection;
}

async function requireDatabase(req, res, next) {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(503).json({ message: "Database is temporarily unavailable. Please try again shortly." });
  }
}

void connectDatabase().catch((error) => console.error("MongoDB connection error:", error.message));

app.use(["/api/disasters", "/api/auth"], requireDatabase);
app.use("/api/disasters", disasterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/air", airRoutes);
app.use("/api/nearby", nearbyRoutes);

module.exports = app;
