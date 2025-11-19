// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");

// // route imports
// const authRoutes = require("./routes/authRoutes");
// const teamRoutes = require("./routes/teamRoutes");
// const projectRoutes = require("./routes/projectRoutes");
// const taskRoutes = require("./routes/taskRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const app = express();

// app.use(cors());
// app.use(express.json());

// // connect DB
// connectDB();

// // mount routes
// app.use("/api/auth", authRoutes);
// app.use("/api/teams", teamRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// app.get("/", (req, res) => res.send("Smart Task Manager API running"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectDB = require("./config/db");

// route imports
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB (cached for serverless)
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => res.send("Smart Task Manager API running"));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// export serverless handler
module.exports = app;
module.exports.handler = serverless(app);
