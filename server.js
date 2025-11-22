const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);
app.use("/api/v1/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const mongoURI =
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_TEST_URI
        : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    // ✅ Fixed: Removed deprecated options and added serverless optimizations
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = mongoose.connection.readyState === 1;
    console.log(
      `MongoDB connected successfully in ${
        process.env.NODE_ENV || "development"
      } mode`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

// Middleware to ensure database connection (BEFORE routes)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello Task Manager",
    api: "Task Manager API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: isConnected ? "connected" : "disconnected",
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      projects: "/api/projects",
      tasks: "/api/tasks",
      team: "/api/team",
      summary: "/api/summary",
      banner: "/api/banner",
      activities: "/api/activities",
    },
    documentation: "See API_ENDPOINTS.md for detailed documentation",
  });
});

// API v1 info endpoint (for backward compatibility)
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Quiz Contest API v1",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      projects: "/api/v1/projects",
      tasks: "/api/v1/tasks",
      team: "/api/v1/team",
      summary: "/api/v1/summary",
      activities: "/api/v1/activities",
    },
    documentation: "See API_ENDPOINTS.md for detailed documentation",
  });
});

// API routes (v1 - for backward compatibility)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/teams", teamRoutes);

// API routes (current version)
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Handle favicon.ico requests
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Error handling middleware (MUST be last)
app.use(notFound);
app.use(errorHandler);

// Start server only in non-serverless environment
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  };

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.log("Unhandled Promise Rejection:", err.message);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err.message);
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  startServer();
}

// Export for Vercel serverless
module.exports = app;
