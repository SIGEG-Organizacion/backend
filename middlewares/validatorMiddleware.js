import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js"; // Adjust path as needed

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    const validationRes = await Promise.all(validations.map((v) => v.run(req)));

    console.log("validating...");
    const errors = validationResult(req);
    if (errors.isEmpty()) return next(); // No errors → proceed
    console.log("Errors found...");
    errors.array().forEach((error) => {
      console.log(error);
    });

    next(
      AppError.badRequest("ValidationError: Missing or invalid required fields")
    );
  };
};
