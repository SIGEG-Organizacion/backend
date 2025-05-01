// To-Do List for /services/userService.js
// =======================================
//
// [ ] 1. Import necessary modules:
//       - User model (from '../models/userModel.js')
//       - Bcryptjs for password hashing (bcrypt)
//       - JWT for token generation (jsonwebtoken)
// [ ] 2. Create a function to register a new user:
//       - Validate the input data (e.g., name, email, password)
//       - Check if the email already exists in the database
//       - Hash the password using bcrypt before saving the user
//       - Create a new user and save it to the database
//       - Generate a JWT token for the user
//       - Return the created user and the JWT token
// [ ] 3. Create a function to log in a user:
//       - Validate the email and password from the request
//       - Check if the user exists in the database (by email)
//       - Compare the provided password with the stored hashed password
//       - If valid, generate and return a JWT token
//       - Handle incorrect email or password
// [ ] 4. Create a function to find a user by email (optional, for other services or controllers):
//       - Accept email as an argument
//       - Return the user document or `null` if not found
// [ ] 5. Create a function to handle password hashing:
//       - Accept the raw password
//       - Return the hashed password using bcrypt.hash()
// [ ] 6. Add any additional utility methods if needed (e.g., generating refresh tokens, updating user details)
// [ ] 7. Test the functions to ensure:
//       - User registration correctly creates a new user and returns the JWT token
//       - User login correctly authenticates and generates a valid token
//       - Password hashing and comparison work as expected
//       - All necessary error handling (e.g., invalid data, user not found, wrong password) is in place

import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const registerUser = async (data) => {
  const exists = await User.findOne({ correo: data.correo });
  if (exists) throw new Error("Correo ya registrado");
  const user = new User(data);
  await user.save();
  return { user, token: generateToken(user) };
};

export const loginUser = async (correo, contraseña) => {
  const user = await User.findOne({ correo });
  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await user.matchPassword(contraseña);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  return { user, token: generateToken(user) };
};
