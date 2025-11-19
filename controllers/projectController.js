const Project = require("../models/Project");
const Team = require("../models/Team");
exports.createProject = async (req, res) => {
  try {
    const { name, description, team } = req.body;

    const project = await Project.create({
      name,
      description,
      team,
      createdBy: req.user.id,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find all teams the user owns or belongs to
    const teams = await Team.find({
      $or: [{ owner: userId }, { "members.memberId": userId }],
    }).select("_id");

    const teamIds = teams.map((t) => t._id);

    // 2. Fetch all projects under those teams
    const projects = await Project.find({
      team: { $in: teamIds },
    })
      .populate("team")
      .populate("createdBy", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectsByUuid = async (req, res) => {
  try {
    const uuid = req.params.projectId;

    // Use findById instead of find()
    const project = await Project.findById(uuid)
      .populate("team", "name members")
      .populate("createdBy", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const projects = await Project.find({ team: teamId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
