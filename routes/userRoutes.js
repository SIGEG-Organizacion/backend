// routes/userRoutes.js

// To-Do List for /routes/userRoutes.js
// ===================================
//
// [ ] 1. Import necessary modules:
//       - Express router
//       - User controller methods (registerUser, loginUser)
// [ ] 2. Define the routes for user-related actions:
//       - POST /register: Call the registerUser method from userController to handle user registration
//       - POST /login: Call the loginUser method from userController to handle user login
// [ ] 3. Add validation and authentication middleware if necessary:
//       - Ensure required fields are provided (e.g., email, password)
//       - Apply JWT verification middleware on protected routes (e.g., user profile retrieval)
// [ ] 4. Add error handling for invalid requests (missing data, invalid email/password)
// [ ] 5. Test the routes to ensure:
//       - User registration works as expected (creates a user and returns a token)
//       - User login works as expected (returns a valid token)
//       - Proper responses and status codes are returned on success/failure

import express from "express";
import { registerUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);

export default router;
