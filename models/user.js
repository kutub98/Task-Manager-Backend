const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
});

// ..
module.exports = mongoose.model("User", UserSchema);
