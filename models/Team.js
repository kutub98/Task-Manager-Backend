const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const MemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      default: uuid,
    },
    name: { type: String, required: true },
    role: { type: String, default: "member" },
    capacity: { type: Number, default: 0 },
  },
  { _id: true },
  { timestamps: true }
);

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [MemberSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", TeamSchema);
