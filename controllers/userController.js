import {
  login,
  createUser,
  generateNewToken,
  createCompany,
  createStudent,
  manageUser,
  updateProfile,
  resetPasswordWithToken,
} from "../services/userService.js";
import { upload } from "../middlewares/fileUpload.js";
import { uploadLogoToB2 } from "../utils/b2Uploader.js";
import { sendMail } from "../services/emailService.js";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
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

export const createCompanyUser = async (req, res, next) => {
  const { email, sector, address } = req.body;

  try {
    await createCompany(email, sector, address);

    res.status(201).json({
      message: "Company created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const createStudentUser = async (req, res, next) => {
  try {
    const { email, major, admissionYear } = req.body;
    await createStudent(email, major, admissionYear);
    res.status(201).json({
      message: "User rol asignment successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Login an existing user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/forgot-password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // Mensaje genérico para no revelar si el usuario existe
    const genericMsg = {
      message: "If the email exists, a new password has been sent.",
    };
    if (!user) {
      return res.status(200).json(genericMsg);
    }
    // Generar contraseña random válida (mínimo 8 caracteres, mayúscula, minúscula, número, símbolo)
    const randomPassword = Array(12)
      .fill(0)
      .map(() =>
        String.fromCharCode(Math.floor(Math.random() * (126 - 33)) + 33)
      )
      .join("");
    // Hashear y guardar
    user.password = await bcrypt.hash(randomPassword, 10);
    await user.save();
    // Enviar correo
    await sendMail({
      to: user.email,
      subject: "Restablecimiento de contraseña SIGEV / Password Reset",
      html: `<p>Hola,</p>
        <p>Tu nueva contraseña temporal es: <b>${randomPassword}</b></p>
        <p>Por favor inicia sesión y cámbiala lo antes posible.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        <hr />
        <p>Hello,<br>Your new temporary password is: <b>${randomPassword}</b><br>Please log in and change it as soon as possible.<br>If you did not request this, please ignore this message.</p>`,
    });
    return res.status(200).json(genericMsg);
  } catch (err) {
    next(err);
  }
};

// Reset password with token
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await resetPasswordWithToken(token, newPassword);
    res.json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = (req, res, next) => {
  const { _id, __v, ...userWithoutIdAndV } = req.user.toObject
    ? req.user.toObject()
    : req.user;
  res.status(200).json({ user: userWithoutIdAndV });
};

export const manageUserAccess = async (req, res, next) => {
  const { email, action } = req.body;
  try {
    const result = await manageUser(email, action);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCurrentUser = async (req, res, next) => {
  const { updateData } = req.body;
  try {
    const userId = req.user._id;
    const updatedUser = await updateProfile(userId, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
