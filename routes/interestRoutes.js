// routes/interestRoutes.js
console.log("📆 interest loaded");
import express from "express";
import {
  markInterest,
  unmarkInterest,
  getUserInterests,
  getInterestByMail,
  getInterestByOpportunity,
} from "../controllers/interestController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import {
  uuidValidatorBody,
  uuidValidator,
} from "../validators/opportunityValidator.js";
import { emailValidator } from "../validators/usersValidator.js";

const router = express.Router();

router.post(
  "/mark",
  protect,
  authorizeRoles("student", "graduate"),
  validateRequest([uuidValidatorBody]),
  markInterest
);
router.delete(
  "/unmark/:uuid",
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
router.get(
  "/:mail",
  protect,
  validateRequest([emailValidator]),
  getInterestByMail
);
router.get(
  "/opportunity/:uuid",
  protect,
  validateRequest([uuidValidator]),
  getInterestByOpportunity
);

export default router;
