import { query } from "express-validator";
import { uuidValidatorQuery } from "./opportunityValidator.js";

const startDateValidation = query("startDate")
  .optional()
  .isISO8601()
  .toDate()
  .withMessage("Start date must be a valid ISO8601 date")
  .custom((value, { req }) => {
    if (req.query.endDate && new Date(value) > new Date(req.query.endDate)) {
      throw new Error("Start date must be before end date");
    }
    return true;
  });

const endDateValidation = query("endDate")
  .optional()
  .isISO8601()
  .toDate()
  .withMessage("End date must be a valid ISO8601 date")
  .custom((value, { req }) => {
    if (
      req.query.startDate &&
      new Date(value) < new Date(req.query.startDate)
    ) {
      throw new Error("End date must be after start date");
    }
    return true;
  });

const companyNameValidation = query("companyName")
  .optional()
  .trim()
  .isLength({ min: 2 })
  .withMessage("Company name must be at least 2 characters long")
  .escape();

const groupByValidation = query("groupBy")
  .optional()
  .isIn(["day", "month", undefined])
  .withMessage('groupBy must be either "day", "month" or omitted');

const forStudentsValidation = query("forStudents")
  .optional()
  .isBoolean()
  .withMessage("forStudents must be a boolean value")
  .toBoolean();

const validatedValidation = query("validated")
  .optional()
  .isBoolean()
  .withMessage("forStudents must be a boolean value")
  .toBoolean();

const statusValidation = query("status")
  .optional()
  .isIn(["open", "closed", "pending-approval", undefined])
  .withMessage(
    'Status must be "open", "closed", "pending-approval" or omitted'
  );

const roleValidation = query("role")
  .optional()
  .isIn(["company", "student", "graduate", undefined])
  .withMessage('Status must be "company", "student", "graduate" or omitted');

const opportunityIdValidation = query("opportunityId")
  .optional()
  .isMongoId()
  .withMessage("Invalid opportunity ID format");

export const opportunityStatsValidator = [
  startDateValidation,
  endDateValidation,
  companyNameValidation,
  statusValidation,
  forStudentsValidation,
  groupByValidation,
];

export const interestStatsValidator = [
  uuidValidatorQuery,
  startDateValidation,
  endDateValidation,
  forStudentsValidation,
  statusValidation,
  companyNameValidation,
];

export const opportunitiesNumbersValidator = [
  startDateValidation,
  endDateValidation,
  companyNameValidation,
  forStudentsValidation,
  groupByValidation,
];

export const usersNumbersValidator = [validatedValidation, roleValidation];
