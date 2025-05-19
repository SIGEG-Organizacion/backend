import { body } from "express-validator";
import { emailValidator } from "./usersValidator.js";

// Individual validators
const descriptionValidator = body("description")
  .trim()
  .isLength({ min: 50 })
  .withMessage("Description must be at least 50 characters long");

const deadlineValidator = body("deadline")
  .isDate()
  .withMessage("Deadline must be a valid date")
  .custom((value) => {
    const today = new Date();
    const deadlineDate = new Date(value);
    return deadlineDate > today;
  })
  .withMessage("Deadline must be after today");

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

const contactValidator = body("contact")
  .isString()
  .trim()
  .notEmpty()
  .withMessage("Contact must be a non-empty string");

// Combined validators for different routes
export const createOpportunityValidation = [
  descriptionValidator,
  deadlineValidator,
  requirementsValidator,
  benefitsValidator,
  modeValidator,
  contactValidator,
  emailValidator,
];

export const updateOpportunityValidation = [
  descriptionValidator,
  deadlineValidator,
  requirementsValidator,
  benefitsValidator,
  modeValidator,
  contactValidator,
  emailValidator,
];
