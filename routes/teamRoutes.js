const express = require("express");
const router = express.Router();
const {
  createTeam,
  addMember,
  editMember,
  deleteMember,
  getTeamsByProjectId,
  getTeam,
  getTeamByProjectId,
} = require("../controllers/teamController");
const auth = require("../middleware/auth");

router.get("/", auth, getTeam);
router.get("/:teamId", auth, getTeamByProjectId);
router.post("/create", auth, createTeam);

router.put("/:teamId/members/add", auth, addMember);
router.put("/:teamId/members/edit/:memberId", auth, editMember);
router.delete("/:teamId/members/delete/:memberId", auth, deleteMember);

module.exports = router;
