import { body, param, query } from "express-validator";

// Regex para horas en HH:mm o H:mm
const timeFormatRegex = /^([0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;

const startTimeValidator = body("startTime")
  .matches(timeFormatRegex)
  .withMessage("startTime must be in HH:mm format");

const endTimeValidator = body("endTime")
  .matches(timeFormatRegex)
  .withMessage("endTime must be in HH:mm format")
  .custom((value, { req }) => {
    if (!req.body.startTime) return true;
    const [sh, sm] = req.body.startTime.split(":").map(Number);
    const [eh, em] = value.split(":").map(Number);
    if (sh * 60 + sm >= eh * 60 + em) {
      throw new Error("endTime must be after startTime");
    }
    return true;
  });

// ID de slot en URL
const slotIdValidator = param("slotId")
  .isMongoId()
  .withMessage("Invalid slotId: must be a valid Mongo ID");

const emailQueryValidator = query("email")
  .notEmpty()
  .withMessage("Query param 'email' is required")
  .isEmail()
  .withMessage("Please provide a valid email")
  .normalizeEmail();

export const createSlotValidator = [
  body("date")
    .notEmpty()
    .withMessage("date is required")
    .isISO8601()
    .toDate()
    .withMessage("date must be a valid ISO8601 date (YYYY-MM-DD)"),
  startTimeValidator,
  endTimeValidator,
];

export const updateSlotValidator = [
  slotIdValidator,
  body("date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("date must be a valid ISO8601 date (YYYY-MM-DD)"),
  body("startTime")
    .optional()
    .matches(timeFormatRegex)
    .withMessage("startTime must be in HH:mm format"),
  body("endTime")
    .optional()
    .matches(timeFormatRegex)
    .withMessage("endTime must be in HH:mm format")
    .custom((value, { req }) => {
      if (!req.body.startTime) return true;
      const [sh, sm] = req.body.startTime.split(":").map(Number);
      const [eh, em] = value.split(":").map(Number);
      if (sh * 60 + sm >= eh * 60 + em) {
        throw new Error("endTime must be after startTime");
      }
      return true;
    }),
];

export const deleteSlotValidator = [slotIdValidator];
export const listSlotsValidator = [emailQueryValidator];

export const requestIdParamValidator = [
  param("requestId").isMongoId().withMessage("Invalid request ID format"),
];

export const createRequestValidator = [
  body("adminEmail")
    .notEmpty()
    .withMessage("adminEmail is required")
    .isEmail()
    .withMessage("adminEmail must be a valid email")
    .normalizeEmail(),

  body("requestDate")
    .notEmpty()
    .withMessage("requestDate is required")
    .isISO8601()
    .toDate()
    .withMessage("requestDate must be a valid ISO8601 date (YYYY-MM-DD)"),

  startTimeValidator,
  endTimeValidator,

  body("calendarProvider")
    .isIn(["google", "microsoft"])
    .withMessage("calendarProvider must be either 'google' or 'microsoft'"),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("description must be at most 500 characters"),
];
