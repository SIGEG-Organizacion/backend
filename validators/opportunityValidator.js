//validators/opportunityValidator.js
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

// Adaptadores para form-data: permiten que los campos vengan como string y los convierten
const requirementsValidator = body("requirements")
  .customSanitizer((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map((s) => s.trim());
    return [];
  })
  .isArray()
  .withMessage("Requirements must be an array")
  .custom((requirements) => {
    return requirements.every(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  })
  .withMessage("Each requirement must be a non-empty string");

const benefitsValidator = body("benefits")
  .customSanitizer((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map((s) => s.trim());
    return [];
  })
  .isArray()
  .withMessage("Benefits must be an array")
  .custom((benefits) => {
    return benefits.every(
      (item) => typeof item === "string" && item.trim().length > 0
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
  .customSanitizer((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value === "true";
    return false;
  })
  .isBoolean()
  .withMessage("Invalid boolean value")
  .toBoolean();

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
  forStudentsValidator.optional(),
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
