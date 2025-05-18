import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";
import Company from "../models/companyModel.js";
import Student from "../models/studentModel.js";

export const createUser = async (name, email, password, role, phone_number) => {
  const existingUser = await User.findOne({
    $or: [{ email: email }, { phone_number: phone_number }],
  });
  /*
  const existingUserWithPhoneNumber = await User.findOne({
    phone_number: phone_number,
  });
  */
  if (existingUser || false) {
    throw AppError.conflict(
      "Invalid credentials: user with email or phone number already registered"
    );
  }
  const user = await User.create({
    name,
    email,
    password, // Hashed automáticamente por el modelo
    role,
    phone_number,
    validated: false,
  });
  const token = generateToken(user);
  return { user, token };
};

export const createCompany = async (email, sector, address, logo) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw AppError.notFound("User not found");
  }
  if (existingUser.role != "company") {
    throw AppError.badRequest("User with innadecuate role");
  }
  const company = await Company.create({
    userId: existingUser._id,
    sector,
    address,
    logo,
  });
};

export const createStudent = async (email, major, admissionYear) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw AppError.notFound("User not found");
  }
  if (existingUser.role != "student") {
    throw AppError.badRequest("User with innadecuate role");
  }
  const company = await Student.create({
    userId: existingUser._id,
    major,
    admissionYear,
  });
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.notFound("User not found");
  }
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid credentials");
  }
  const token = generateToken(user);
  return { user: user.toObject(), token };
};

export const generateNewToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw AppError.notFound("Invalid credentials");
  const { resetToken, hashedToken, expires } = generateResetToken();
  user.resetToken = hashedToken;
  user.resetTokenExpire = expires;
  await user.save();
  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw AppError.unauthorized("Invalid or expired token");
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  await user.save();
};

const comparePasswords = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expires = Date.now() + 10 * 60 * 1000;

  return { resetToken, hashedToken: hashed, expires };
};
