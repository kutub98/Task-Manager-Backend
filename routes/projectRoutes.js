const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjectsByTeam,
  getUserProjects,
  getProjectsByUuid,
} = require("../controllers/projectController");
const auth = require("../middleware/auth");

router.get("/", auth, getUserProjects);
router.post("/create", auth, createProject);

router.get("/team/:teamId", auth, getProjectsByTeam);
router.get("/:projectId", auth, getProjectsByUuid); // FIXED

module.exports = router;
