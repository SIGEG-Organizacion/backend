import { body, param, query } from "express-validator";
import { emailValidator } from "./usersValidator.js";
import { formatValidator } from "./flyerValidator.js";

// Individual validators
const descriptionValidator = body("description")
  .trim()
  .isLength({ min: 30 })
  .withMessage("Description must be at least 50 characters long");

const deadlineValidator = body("deadline")
  .isISO8601()
  .toDate()
  .withMessage("Deadline must be a valid date")
  .custom((value) => {
    const today = new Date();
    const deadlineDate = new Date(value);
    return deadlineDate > today;
  })
  .withMessage("Deadline must be after today");

const startingRangeValidator = query("from")
  .isISO8601()
  .toDate()
  .withMessage("Deadline must be a valid date")
  .custom((value) => {
    const validDate = new Date("2025-05-19");
    const date = new Date(value);
    return date >= validDate;
  })
  .withMessage("Start range must be valid date");

const endRangeValidator = body("to")
  .isISO8601()
  .toDate()
  .withMessage("Deadline must be a valid date");

const requirementsValidator = body("requirements")
  .isArray({ min: 1 })
  .withMessage("Requirements must be a non-empty array")
  .custom((requirements) => {
    return requirements.every(
      (item) => typeof item === "string" && item.trim().length >= 1
    );
  })
  .withMessage("Each requirement must be a non-empty string");

const benefitsValidator = body("benefits")
  .isArray({ min: 1 })
  .withMessage("Benefits must be a non-empty array")
  .custom((benefits) => {
    return benefits.every(
      (item) => typeof item === "string" && item.trim().length >= 1
    );
  })
  .withMessage("Each benefit must be a non-empty string");

const modeValidator = body("mode")
  .isIn(["remote", "on-site", "hybrid"])
  .withMessage("Mode must be one of: remote, on-site, or hybrid");

export const uuidValidator = param("uuid")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Invalid uuid length");

export const uuidValidatorBody = body("uuid")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Invalid uuid length");

export const uuidValidatorQuery = query("uuid")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Invalid uuid length")
  .optional();

export const forStudentsValidator = body("forStudents")
  .isBoolean()
  .withMessage("Invalid boolean value");

// Combined validators for different routes
export const createOpportunityValidation = [
  descriptionValidator,
  requirementsValidator,
  benefitsValidator,
  modeValidator,
  deadlineValidator,
  emailValidator,
  formatValidator,
  forStudentsValidator,
];

export const updateOpportunityValidation = [
  uuidValidator,
  descriptionValidator.optional(),
  requirementsValidator.optional(),
  benefitsValidator.optional(),
  modeValidator.optional(),
  deadlineValidator.optional(),
  emailValidator.optional(),
  forStudentsValidator,
];

export const filterOpportunityValidator = [
  query("mode")
    .isIn(["remote", "on-site", "hybrid"])
    .withMessage("Mode must be one of: remote, on-site, or hybrid")
    .optional(),
  startingRangeValidator.optional(),
  body("sector").notEmpty().withMessage("Sector is required").optional(),
  ,
];
