import { body } from "express-validator";
// Individual validators
export const formatValidator = body("format")
  .isIn(["PDF", "JPG"])
  .withMessage("Mode must be one of: remote, on-site, or hybrid");
