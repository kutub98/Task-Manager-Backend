// const mongoose = require("mongoose");

// const TaskSchema = new mongoose.Schema({
//   project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

//   title: String,
//   description: String,

//   assignedMember: {
//     _id: false,
//     name: String,
//     memberId: String,
//   },

//   priority: {
//     type: String,
//     enum: ["Low", "Medium", "High"],
//     default: "Low",
//   },

//   status: {
//     type: String,
//     enum: ["Pending", "In Progress", "Done"],
//     default: "Pending",
//   },

//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Task", TaskSchema);

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, default: "" },

    assignedMember: {
      memberId: { type: String, default: null },
      name: { type: String, default: "Unassigned" },
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
