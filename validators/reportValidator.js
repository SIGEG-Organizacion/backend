import { query } from "express-validator";

export const reportOpportunitiesValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Start date must be a valid ISO8601 date")
    .custom((value, { req }) => {
      if (req.query.endDate && new Date(value) > new Date(req.query.endDate)) {
        throw new Error("Start date must be before end date");
      }
      return true;
    }),

  query("endDate")
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
    }),

  query("companyName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Company name must be at least 2 characters long")
    .escape(),

  query("forStudents")
    .optional()
    .isBoolean()
    .withMessage("forStudents must be a boolean value")
    .toBoolean(),

  query("groupBy")
    .optional()
    .isIn(["day", "month", undefined])
    .withMessage('groupBy must be either "day", "month" or omitted'),
];
