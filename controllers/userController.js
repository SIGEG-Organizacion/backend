// controllers/userController.js

// To-Do List for /controllers/userController.js
// ============================================
//
// [ ] 1. Import necessary modules:
//       - User model (from '../models/userModel.js')
//       - JWT for token generation
//       - Bcrypt for password hashing
// [ ] 2. Implement registerUser method to:
//       - Validate incoming request data (name, email, password, role)
//       - Check if the user already exists (by email)
//       - Hash the password before saving it
//       - Create a new user and save it to the database
//       - Generate a JWT token for the user
//       - Respond with the newly created user and token
// [ ] 3. Implement loginUser method to:
//       - Validate the incoming request data (email and password)
//       - Check if the user exists by email
//       - Compare the provided password with the stored hashed password
//       - If correct, generate a JWT token and send it back with user data
// [ ] 4. Add error handling for:
//       - User not found
//       - Invalid password
//       - Missing or invalid data in the request
// [ ] 5. Test the controller functions to ensure:
//       - Registration creates a new user
//       - Login correctly authenticates the user and returns a token
// [ ] 6. Optionally, add methods for:
//       - Retrieving user profile (getUserProfile)
//       - Updating user profile (updateUserProfile)

import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;

  try {
    const user = new User({ nombre, correo, contraseña, rol });
    await user.save();
    res.status(201).json({ mensaje: "Usuario registrado exitosamente", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
