import {
  login,
  createUser,
  generateNewToken,
} from "../services/userService.js";
import {
  validateRegisterUser,
  validateLoginUser,
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/validationMiddleware.js";
import { AppError } from "../utils/AppError.js";

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    validateRegisterUser(req, res, next);
    const { name, email, password, role, phone_number } = req.body;
    const { user, token } = await createUser(
      name,
      email,
      password,
      role,
      phone_number
    );
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// Login an existing user
export const loginUser = async (req, res, next) => {
  try {
    validateLoginUser(req, res, next);
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// Forgot password - generate and return reset token
export const forgotPassword = async (req, res, next) => {
  try {
    validateForgotPassword(req, res, next);
    const { email } = req.body;
    const resetToken = await generateNewToken(email);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    res.json({
      message: "Password reset link generated",
      resetUrl, // lo copias desde aquí para hacer reset
    });
  } catch (err) {
    next(err);
  }
};

// Reset password with token
export const resetPassword = async (req, res, next) => {
  try {
    validateResetPassword(req, res, next);
    const { token, newPassword } = req.body;
    resetPassword(token, newPassword);
    res.json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = (req, res, next) => {
  res.status(200).json({ user: req.user });
};
