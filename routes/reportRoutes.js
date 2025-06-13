import express from "express";

import {
  generateReportOpportunitiesNumbers,
  generateReportOpportunitiesStatus,
  generateReportInterest,
  generateReportUsers,
} from "../controllers/reportController.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  opportunitiesNumbersValidator,
  opportunityStatsValidator,
  usersNumbersValidator,
  interestStatsValidator,
} from "../validators/reportValidator.js";
const router = express.Router();

router.get(
  "/numberOpportunitiesCreated",
  protect,
  authorizeRoles("adminLink", "adminTFG"),
  validateRequest(opportunitiesNumbersValidator),
  generateReportOpportunitiesNumbers
);

router.get(
  "/statusOpportunities",
  protect,
  authorizeRoles("adminLink", "adminTFG", "company"),
  validateRequest(opportunityStatsValidator),
  generateReportOpportunitiesStatus
);

router.get(
  "/interest",
  protect,
  authorizeRoles("adminLink", "adminTFG", "company"),
  validateRequest(interestStatsValidator),
  generateReportInterest
);

router.get(
  "/users",
  protect,
  authorizeRoles("adminLink", "adminTFG"),
  validateRequest(usersNumbersValidator),
  generateReportUsers
);

export default router;
