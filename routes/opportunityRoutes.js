//routes/opportunityRoutes.js
import express from "express";
import {
  createPublication,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByCompany,
  getOpportunity,
  filterOpportunities,
  getOpportunities,
  getFlyerSignedUrl,
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
import { upload } from "../middlewares/fileUpload.js";

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  protect,
  authorizeRoles("company"),
  validateRequest(createOpportunityValidation),
  createPublication
);

router.put(
  "/update/:uuid",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  protect,
  authorizeRoles("company", "adminTFG", "adminLink"),
  validateRequest(updateOpportunityValidation),
  updateOpportunity
);
router.delete(
  "/delete/:uuid",
  protect,
  authorizeRoles("company", "adminTFG", "adminLink"),
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
router.get("/flyer/signed-url", protect, getFlyerSignedUrl);

export default router;
