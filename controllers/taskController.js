const Task = require("../models/Task");
const Project = require("../models/Project");
const Team = require("../models/Team");
const ActivityLogs = require("../models/ActivityLog");
// const Task = require("../models/Task");
// const Project = require("../models/Project");

exports.createTask = async (req, res) => {
  try {
    const { project, title, description, assignedMember, priority, status } =
      req.body;

    const projectData = await Project.findById(project).populate("team");
    const team = await Team.findById(projectData.team);

    // Validate assigned member
    let assigned = { name: "Unassigned", memberId: null };

    if (assignedMember?.memberId) {
      const exists = team.members.find(
        (m) => m.memberId === assignedMember.memberId
      );

      if (!exists)
        return res.status(400).json({ error: "Member not in this team!" });

      assigned = {
        name: exists.name,
        memberId: exists.memberId,
      };
    }

    const task = await Task.create({
      project,
      title,
      description,
      assignedMember: assigned,
      priority,
      status,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasksByMember = async (req, res) => {
  try {
    const tasks = await Task.find({
      "assignedMember.memberId": req.params.memberId,
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.autoAssignTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const team = await Team.findById(project.team);

    const tasks = await Task.find({ project: projectId });

    const loadMap = {};

    team.members.forEach((m) => {
      loadMap[m.memberId] = { member: m, count: 0 };
    });

    tasks.forEach((task) => {
      if (task.assignedMember?.memberId) {
        loadMap[task.assignedMember.memberId].count++;
      }
    });

    const best = Object.values(loadMap).sort((a, b) => a.count - b.count)[0];

    res.json(best.member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedMember, priority, status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { title, description, assignedMember, priority, status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reassignTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    const teams = await Team.find();
    let logs = [];

    for (let team of teams) {
      let capacityMap = {};

      team.members.forEach((m) => {
        capacityMap[m.memberId] = {
          name: m.name,
          capacity: m.capacity,
          tasks: [],
          memberId: m.memberId,
        };
      });

      tasks.forEach((t) => {
        if (capacityMap[t.assignedMember?.memberId]) {
          capacityMap[t.assignedMember.memberId].tasks.push(t);
        }
      });

      for (let mId in capacityMap) {
        let info = capacityMap[mId];
        let overload = info.tasks.length - info.capacity;

        if (overload > 0) {
          let movable = info.tasks.filter((t) => t.priority !== "High");

          for (let i = 0; i < overload; i++) {
            let task = movable[i];
            if (!task) continue;

            let target = Object.values(capacityMap).find(
              (x) => x.tasks.length < x.capacity
            );

            if (target) {
              await Task.findByIdAndUpdate(task._id, {
                assignedMember: {
                  name: target.name,
                  memberId: target.memberId,
                },
              });

              target.tasks.push(task);

              logs.push({
                message: `Task "${task.title}" reassigned from ${info.name} to ${target.name}.`,
              });
            }
          }
        }
      }
    }

    await ActivityLogs.insertMany(logs);

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Checks if a user can modify a task
 */
const canModifyTask = (user, task, project) => {
  if (!user || !task || !project) return false;

  // Project owner can modify
  if (project.ownerId?.toString() === user._id?.toString()) return true;

  // Assigned member can modify
  if (task.assignedMember?.memberId === user.memberId) return true;

  // Task creator can modify
  if (task.createdBy?.toString() === user._id?.toString()) return true;

  return false;
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedMember, priority, status } = req.body;

    // Find task
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Ensure task has a project
    if (!task.project) {
      return res.status(400).json({ error: "Task has no project assigned" });
    }

    // Fetch project
    const project = await Project.findById(task.project);
    if (!project) {
      return res
        .status(400)
        .json({ error: "Task's project does not exist anymore" });
    }

    // Permission check
    if (!canModifyTask(req.user, task, project)) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this task" });
    }

    // Update task fields safely
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;

    if (assignedMember) {
      task.assignedMember = {
        memberId: assignedMember.memberId ?? task.assignedMember?.memberId,
        name: assignedMember.name ?? task.assignedMember?.name,
      };
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate("project");
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findById(task.project);
    if (!canModifyTask(req.user, task, project)) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this task" });
    }

    await task.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
