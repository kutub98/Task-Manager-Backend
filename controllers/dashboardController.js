const Task = require("../models/Task");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const Team = require("../models/Team");

exports.dashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({ createdBy: userId });
    const tasks = await Task.find({});

    const teams = await Team.find({ owner: userId });

    let teamSummary = [];

    for (let team of teams) {
      team.members.forEach((m) => {
        const assigned = tasks.filter(
          (t) => t.assignedMember?.memberId === m.memberId
        );

        teamSummary.push({
          member: m.name,
          tasks: assigned.length,
          capacity: m.capacity,
          overloaded: assigned.length > m.capacity,
        });
      });
    }

    res.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      teamSummary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
