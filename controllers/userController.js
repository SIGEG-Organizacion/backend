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
  console.log(req.files);
  console.log("Datos del cuerpo de la solicitud:", req.body);

  if (!req.files || !req.files.logo) {
    return res.status(400).json({ message: "Logo is required" });
  }
  const { email, sector, address } = req.body;
  const logoFile = req.files.logo;  // El archivo del logo

  try {
    // Subir el logo a Backblaze B2 y obtener la URL
    const logoUrl = await uploadLogoToB2(logoFile.tempFilePath, `logos/${logoFile.name}`);

    // Crear la compañía con la URL del logo
    await createCompany(email, sector, address, logoUrl);

    res.status(201).json({
      message: "User role assignment and company creation successful",
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

// Forgot password - generate and return reset token
export const forgotPassword = async (req, res, next) => {
  try {
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
