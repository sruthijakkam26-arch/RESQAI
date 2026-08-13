const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    severity: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High", "Critical"]
    },

    status: {
        type: String,
        enum: ["active", "resolved"],
        default: "active"
    },

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Disaster", disasterSchema);
