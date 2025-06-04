import express from "express";

import { generateReportOpportunitiesNumbers } from "../controllers/reportController.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { AppError } from "../utils/AppError.js";
import { reportOpportunitiesValidator } from "../validators/reportValidator.js";
const router = express.Router();

router.get(
  "/numberOpportunitiesCreated",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  validateRequest(reportOpportunitiesValidator),
  generateReportOpportunitiesNumbers
);

export default router;
