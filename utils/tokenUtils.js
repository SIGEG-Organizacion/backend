// To-Do List for /utils/tokenUtils.js
// ===================================
//
// [ ] 1. Import necessary modules:
//       - JWT (jsonwebtoken) for generating and verifying tokens
// [ ] 2. Create a function to generate a JWT token:
//       - Accept user data (e.g., userId, role) as input
//       - Sign the JWT using a secret key from environment variables (e.g., process.env.JWT_SECRET)
//       - Set an expiration time for the token (e.g., 1 day)
//       - Return the generated token
// [ ] 3. Create a function to verify a JWT token:
//       - Accept a token as input (usually from the Authorization header)
//       - Use JWT.verify() to verify the token using the same secret key
//       - If the token is valid, return the decoded data (e.g., userId, role)
//       - If the token is invalid, throw an error or return a response indicating failure
// [ ] 4. Create a function to decode a JWT token (optional):
//       - Accept a token and decode it without verifying it (useful for extracting user data without validation)
//       - Return the decoded data (e.g., userId, role)
// [ ] 5. Add any additional utility functions if necessary:
//       - Refresh token logic (optional, for implementing token refresh mechanisms)
// [ ] 6. Test the functions to ensure:
//       - Token generation works and the token is returned correctly
//       - Token verification works and throws errors for invalid tokens
//       - Optional: Token decoding works without verifying the token

import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

