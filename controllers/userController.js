import User from "../models/userModel.js";
import crypto from "crypto";
import {
  comparePasswords,
  generateToken,
  generateResetToken,
} from "../services/userService.js";

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Name, email, password and role are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // Hashed automáticamente por el modelo
      role,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login an existing user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot password - generate and return reset token
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { resetToken, hashedToken, expires } = generateResetToken();
    user.resetToken = hashedToken;
    user.resetTokenExpire = expires;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.json({
      message: "Password reset link generated",
      resetUrl, // lo copias desde aquí para hacer reset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({ user: req.user });
};
