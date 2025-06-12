
import express from "express";
import { getStudentApplications, deleteStudent, markStudentAsGraduated } from "../controllers/studentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/applications",
  protect,
  authorizeRoles("student", "graduate"),
  validateRequest([
    param("email")
      .notEmpty()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
  ]),
  getStudentApplications
);

router.delete(
  "/deleteStudent/:email", 
  protect,
  authorizeRoles("admin"),
  deleteStudent 
);

router.put(
  "/graduate/:id", 
  protect,
  authorizeRoles("admin"), 
  markStudentAsGraduated 
);

export default router;
