
import express from "express";
import {
  createPublication,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByCompany,
  getOpportunity,
  filterOpportunities,
  getOpportunities,
} from "../controllers/opportunityController.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import {
  createOpportunityValidation,
  updateOpportunityValidation,
  filterOpportunityValidator,
  uuidValidator,
} from "../validators/opportunityValidator.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { query } from "express-validator";
const router = express.Router();

router.post(
  "/create",
  protect,
  authorizeRoles("company"),
  validateRequest(createOpportunityValidation),
  createPublication
);
router.put(
  "/update/:uuid",
  protect,
  authorizeRoles("company"),
  validateRequest(updateOpportunityValidation),
  updateOpportunity
);
router.delete(
  "/delete/:uuid",
  protect,
  authorizeRoles("company", "adminLink"),
  validateRequest([uuidValidator]),
  deleteOpportunity
);

router.get(
  "/listByCompany",
  protect,
  validateRequest([
    query("company_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Invalid sector name"),
  ]),
  getOpportunitiesByCompany
);
router.get("/list", protect, getOpportunities);
router.get(
  "/filter",
  protect,
  validateRequest(filterOpportunityValidator),
  filterOpportunities
);
router.get("/:uuid", protect, validateRequest([uuidValidator]), getOpportunity);

export default router;
