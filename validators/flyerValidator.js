import { body } from "express-validator";
// Individual validators
export const formatValidator = body("format")
  .isIn(["PDF", "JPG"])
  .withMessage("Format must be one of: PDF or JPG");
