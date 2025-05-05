// routes/interestRoutes.js
import express from "express";
import {
  markInterest,
  unmarkInterest,
  getUserInterests,
} from "../controllers/interestController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("student", "graduate"), markInterest);
router.delete("/:opportunityId", protect, authorizeRoles("student", "graduate"), unmarkInterest);
router.get("/", protect, authorizeRoles("student", "graduate"), getUserInterests);

export default router;
