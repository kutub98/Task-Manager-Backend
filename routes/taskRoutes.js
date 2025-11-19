// const express = require("express");
// const router = express.Router();
// const {
//   createTask,
//   getTasksByProject,
//   autoAssignTask,
//   reassignTasks,
// } = require("../controllers/taskController");

// const auth = require("../middleware/auth");

// router.post("/create", auth, createTask);
// router.get("/:projectId", auth, getTasksByProject);

// router.get("/auto-assign/:projectId", auth, autoAssignTask);
// router.post("/reassign", auth, reassignTasks);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTasksByMember,
  autoAssignTask,
  reassignTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const auth = require("../middleware/auth");

// Create a new task
router.post("/create", auth, createTask);

// Get tasks by project
// router.get("/:projectId", auth, getTasksByProject);
router.get("/:projectId", auth, getTasksByProject);

// Get tasks by member
router.get("/member/:memberId", auth, getTasksByMember);

// Auto-assign task in a project
router.get("/auto-assign/:projectId", auth, autoAssignTask);

// Reassign tasks across teams
router.post("/reassign", auth, reassignTasks);

// Update a task (with access control in controller)
router.put("/updated/:taskId", auth, updateTask);

// Delete a task (with access control in controller)
router.delete("/delete/:taskId", auth, deleteTask);

module.exports = router;
