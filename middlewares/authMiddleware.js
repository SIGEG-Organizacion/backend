// To-Do List for /middlewares/authMiddleware.js
// ============================================
//
// [ ] 1. Import necessary modules:
//       - JWT for token verification (jsonwebtoken)
//       - User model (optional, for role validation)
// [ ] 2. Create a middleware function to verify the JWT token:
//       - Extract the token from the Authorization header (e.g., `Bearer <token>`)
//       - Verify the token using the JWT secret
//       - If the token is valid, store the decoded user data in `req.user`
//       - If the token is invalid or missing, respond with an error (401 Unauthorized)
// [ ] 3. Create a middleware function to check the user's role (optional):
//       - Check if `req.user.role` matches the required role for the route (e.g., "admin", "student")
//       - If the user doesn't have the required role, respond with an error (403 Forbidden)
// [ ] 4. Add support for protecting specific routes:
//       - Apply the middleware to routes that need authentication (e.g., CRUD operations on user data, creating opportunities)
// [ ] 5. Add error handling for:
//       - Missing or invalid JWT token
//       - Unauthorized access (invalid role or token)
// [ ] 6. Test the middleware to ensure:
//       - The token is correctly verified and decoded
//       - Users are blocked from accessing protected routes without valid tokens
//       - Role-based access works correctly (e.g., only admins can access admin routes)

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};
