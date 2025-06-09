import express from "express";
import {
  registerUser,
  createCompanyUser,
  createStudentUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  manageUserAccess,
  updateCurrentUser,
} from "../controllers/userController.js";
import {
  validateCreateUser,
  validateLogin,
  validateGenerateNewToken,
  validateResetPassword,
  validateCreateCompany,
  validateCreateStudent,
  validateUserAcces,
  validateUpdateUser,
  roleValidator,
} from "../validators/usersValidator.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/fileUpload.js"; 
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
  upload,
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
  protect,
  validateRequest(validateResetPassword),
  resetPassword
);
router.put(
  "/manage",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  validateRequest(validateUserAcces),
  manageUserAccess
);
router.put(
  "/update",
  protect,
  validateRequest(validateUpdateUser),
  updateCurrentUser
);
router.get("/me", protect, getCurrentUser);
router.get(
  "/",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  async (req, res) => {
    const users = await User.find().select(
      "-password -_id -__v -resetToken -resetTokenExpire"
    );
    res.json({ users });
  }
);
router.put(
  "/changeRole/:email",
  protect,
  authorizeRoles("vadminTFG"),
  validateRequest([roleValidator]),
  async (req, res) => {
    const { role } = req.body;
    const user = await User.findOne({ email: req.params.email })?.select(
      "-password -__v -resetToken -resetTokenExpire"
    );
    if (!user) throw AppError.notFound("User not found");
    user.role = role;
    await user.save();
    const { _id, ...userData } = user ? user.toObject() : user;
    res.json({ message: "Role updated", userData });
  }
);

export default router;
