const Project = require("../models/Project");
const Team = require("../models/Team");
const User = require("../models/user");
const { v4: uuid } = require("uuid");

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const team = await Team.create({
      name,
      owner: userId,
      members: [],
    });

    await User.findByIdAndUpdate(userId, { $push: { teams: team._id } });

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getTeamByProjectId = async (req, res) => {
  try {
    const projectId = req.params.id;
    const Team = await Team.find(projectId);
    res.json(Team);
  } catch (error) {
    res.status(404).json({ error: error.message || "not found" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;

    const teams = await Team.find({
      $or: [{ owner: userId }, { "members.memberId": userId }],
    })
      .populate("owner", "name email")
      .populate("members.memberId", "name email");

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, role, capacity } = req.body;

    const member = {
      //   memberId: uuid(), // unique id
      name,
      role,
      capacity,
    };

    const team = await Team.findByIdAndUpdate(
      teamId,
      { $push: { members: member } },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { name, role, capacity } = req.body;

    const team = await Team.findOneAndUpdate(
      { _id: teamId, "members.memberId": memberId },
      {
        $set: {
          "members.$.name": name,
          "members.$.role": role,
          "members.$.capacity": capacity,
        },
      },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findByIdAndUpdate(
      teamId,
      { $pull: { members: { memberId } } },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
