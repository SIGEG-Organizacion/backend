import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getCurrentUser);

router.get(
  "/",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json({ users });
  }
);

router.put(
  "/:id/role",
  protect,
  authorizeRoles("adminLink"),
  async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = role;
    await user.save();
    res.json({ message: "Role updated", user });
  }
);

export default router;
