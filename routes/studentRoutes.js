// To-Do List for /routes/studentRoutes.js
// =======================================
//
// [ ] 1. Import necessary modules:
//       - Express router
//       - Student controller methods (applyForOpportunity, getStudentApplications)
// [ ] 2. Define the routes for student-related actions:
//       - POST /apply: Call the applyForOpportunity method from studentController to handle student applications
//       - GET /applications: Call the getStudentApplications method from studentController to retrieve the student's applications
// [ ] 3. Add validation middleware for incoming requests:
//       - Ensure required fields are provided (e.g., opportunityId, studentId)
//       - Validate student authentication (via JWT token)
// [ ] 4. Add error handling for:
//       - Invalid application data (missing opportunity or student)
//       - Failed to retrieve student applications (no applications found)
// [ ] 5. Test the routes to ensure:
//       - Student can apply for an opportunity successfully
//       - Student can retrieve their application list
//       - Proper responses and status codes are returned on success/failure

import express from "express";
import {
  applyForOpportunity,
  getStudentApplications,
} from "../controllers/studentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateApplication } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/apply", protect, authorizeRoles("student", "graduate"), validateApplication, applyForOpportunity);
router.get("/applications", protect, authorizeRoles("student", "graduate"), getStudentApplications);

export default router;
