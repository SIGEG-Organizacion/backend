import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js"; // Adjust path as needed

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next(); // No errors → proceed

    next(
      AppError.badRequest("ValidationError: Missing or invalid required fields")
    );
  };
};
