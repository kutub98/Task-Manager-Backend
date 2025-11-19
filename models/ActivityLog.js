const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
