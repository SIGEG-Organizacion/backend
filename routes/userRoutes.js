import express from "express";
import {
  registerUser,
  createCompanyUser,
  createStudentUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/userController.js";
import {
  validateCreateUser,
  validateLogin,
  validateGenerateNewToken,
  validateResetPassword,
  validateCreateCompany,
  validateCreateStudent,
} from "../validators/usersValidator.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadLogo } from "../middlewares/fileUpload.js"; 
import User from "../models/userModel.js";
import { AppError } from "../utils/AppError.js";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP",
});

const router = express.Router();

router.post("/register", validateRequest(validateCreateUser), registerUser);
router.post(
  "/createStudent",
  validateRequest(validateCreateStudent),
  createStudentUser
);
router.post(
  "/createCompany",
  validateRequest(validateCreateCompany),
  uploadLogo,
  createCompanyUser
);
router.post("/login", validateRequest(validateLogin), loginUser);
router.post(
  "/forgot-password",
  apiLimiter,
  validateRequest(validateGenerateNewToken),
  forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(validateResetPassword),
  resetPassword
);
router.get("/me", protect, getCurrentUser);
router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
});
router.put(
  "/:id/role",
  protect,
  authorizeRoles("adminLink"),
  async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw AppError.notFound("User not found");
    user.role = role;
    await user.save();
    res.json({ message: "Role updated", user });
  }
);

export default router;
