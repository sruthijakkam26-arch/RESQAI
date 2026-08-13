const express = require("express");
const jwt = require("jsonwebtoken");
const Disaster = require("../modules/Disaster");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Sign in to report a disaster" });
    try {
        req.userId = jwt.verify(token, JWT_SECRET).id;
        next();
    } catch {
        res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
}

// Create a disaster report
router.post("/", requireAuth, async (req, res) => {
    try {
        const { type, description, location, severity } = req.body || {};
        if (![type, description, location, severity].every((value) => typeof value === "string" && value.trim())) {
            return res.status(400).json({ message: "Type, description, location, and severity are required" });
        }
        const disaster = new Disaster({
            type: type.trim(),
            description: description.trim(),
            location: location.trim(),
            severity,
            status: "active",
            reportedBy: req.userId,
        });

        const savedDisaster = await disaster.save();

        res.status(201).json({
            message: "Disaster reported successfully 🚨",
            disaster: savedDisaster
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to report disaster",
            error: error.message
        });
    }
});

// Get all disaster reports
router.get("/", async (req, res) => {
    try {
        const disasters = await Disaster.find().sort({ createdAt: -1 });

        res.json(disasters);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get disasters",
            error: error.message
        });
    }
});

module.exports = router;
