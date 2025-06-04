import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import reporRoutes from "./routes/reportRoutes.js";

// To-Do List for /app.js
// ======================
//
// [ ] 1. Import necessary modules:
//       - Express library (for creating the server)
//       - Mongoose (for MongoDB connection)
//       - dotenv (for environment variable management)
//       - Routes for handling user, student, company, opportunity, admin, and report actions
//       - Middleware (authentication, error handling, etc.)
// [ ] 2. Load environment variables using dotenv:
//       - Ensure .env file contains required variables (e.g., MONGO_URI, JWT_SECRET)
// [ ] 3. Set up the Express app:
//       - Initialize the app using `express()`
//       - Set the port to listen on (e.g., process.env.PORT or default to 5000)
// [ ] 4. Set up middlewares:
//       - Add middleware for parsing JSON (app.use(express.json()))
//       - Add authentication middleware to protect certain routes
//       - Add error handling middleware to capture and respond to errors
// [ ] 5. Set up routes:
//       - Use the defined routes for users, students, companies, opportunities, admin, and reports
//       - Example: `app.use('/api/users', userRoutes)`
// [ ] 6. Set up MongoDB connection:
//       - Connect to MongoDB using Mongoose and the URI from environment variables
//       - Handle connection success and errors
// [ ] 7. Handle server startup:
//       - Add a listener to the port (e.g., `app.listen(PORT, () => { ... })`)
//       - Log a message indicating the server is running and on which port
// [ ] 8. Add optional features:
//       - CORS handling (if necessary) using a CORS middleware
//       - Logging (e.g., using `morgan` or a custom logger)
// [ ] 9. Test the server to ensure:
//       - The app is correctly connected to MongoDB
//       - Routes and endpoints are working as expected
//       - Middleware is handling errors and authentication correctly

// Load env variables
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Database connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
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
