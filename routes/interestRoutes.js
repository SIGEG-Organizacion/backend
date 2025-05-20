// routes/interestRoutes.js
import express from "express";
import {
  markInterest,
  unmarkInterest,
  getUserInterests,
} from "../controllers/interestController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { uuidValidator } from "../validators/opportunityValidator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("student", "graduate"),
  validateRequest([uuidValidator]),
  markInterest
);
router.delete(
  "/:opportunityId",
  protect,
  authorizeRoles("student", "graduate"),
  validateRequest([uuidValidator]),
  unmarkInterest
);
router.get(
  "/",
  protect,
  authorizeRoles("student", "graduate"),
  getUserInterests
);

export default router;
