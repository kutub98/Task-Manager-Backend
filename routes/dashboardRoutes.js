const express = require("express");
const router = express.Router();
const {
  dashboardSummary,
  activityLog,
} = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get("/summary", auth, dashboardSummary);
router.get("/activity", auth, activityLog);

module.exports = router;
