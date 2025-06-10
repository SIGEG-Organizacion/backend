import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import reporRoutes from "./routes/reportRoutes.js";
import startOpportunityCleanupJob from "./utils/opportunityCleaner.js";
import rateLimit from "express-rate-limit";

// Load env variables
dotenv.config();

const app = express();

//limit request
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400,
  message: "Too many requests from this IP",
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "30kb" }));
app.use(morgan("dev"));
app.use("/", apiLimiter);

// Database connection
connectDB();

startOpportunityCleanupJob();

// Routes

app.use("/api/calendar", calendarRoutes);
app.use("/api/fix", userRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/reports", reporRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error in development
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR", err);
  }

  // Send response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
