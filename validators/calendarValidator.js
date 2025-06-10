import { body, param, query } from "express-validator";

const dayOfWeekValidator = body("dayOfWeek")
  .isInt({ min: 0, max: 6 })
  .withMessage("dayOfWeek must be an integer from 0 (Sunday) to 6 (Saturday)");

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const startTimeValidator = body("startTime")
  .matches(timeFormatRegex)
  .withMessage("startTime must be in HH:mm format");

const endTimeValidator = body("endTime")
  .matches(timeFormatRegex)
  .withMessage("endTime must be in HH:mm format")
  .custom((value, { req }) => {
    const [startH, startM] = req.body.startTime?.split(":") || [];
    const [endH, endM] = value.split(":");

    if (startH == null || startM == null) return true; // skip if no startTime provided

    const start = parseInt(startH) * 60 + parseInt(startM);
    const end = parseInt(endH) * 60 + parseInt(endM);
    if (start >= end) {
      throw new Error("startTime must be before endTime");
    }
    return true;
  });

const slotIdValidator = param("slotId")
  .isMongoId()
  .withMessage("Invalid slotId: must be a valid Mongo ID");

const emailQueryValidator = query("email")
  .isEmail()
  .withMessage("Query param 'email' must be a valid email address");

// Validators

export const createSlotValidator = [
  dayOfWeekValidator,
  startTimeValidator,
  endTimeValidator,
];

export const updateSlotValidator = [
  slotIdValidator,
  body("dayOfWeek")
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage("dayOfWeek must be between 0 and 6"),
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
      const [startH, startM] = req.body.startTime?.split(":") || [];
      const [endH, endM] = value.split(":");

      const start = parseInt(startH) * 60 + parseInt(startM);
      const end = parseInt(endH) * 60 + parseInt(endM);
      if (start >= end) {
        throw new Error("startTime must be before endTime");
      }
      return true;
    }),
];

export const deleteSlotValidator = [slotIdValidator];

export const listSlotsValidator = [emailQueryValidator];
