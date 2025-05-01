// To-Do List for /middlewares/errorHandler.js
// =========================================
//
// [ ] 1. Create a middleware function to handle errors:
//       - This function should capture any errors thrown in the application
//       - Ensure it takes 4 arguments (err, req, res, next) to work as an error-handling middleware
// [ ] 2. Check if the error is a validation error or custom error:
//       - If the error is from validation (e.g., from express-validator), send a response with the validation errors
//       - If it's a custom error (e.g., thrown by controllers), send the custom message and status code
// [ ] 3. Handle default errors:
//       - For any uncaught errors, return a generic error message (e.g., `Internal Server Error`)
//       - Log the error details (using `console.error` or a logger like `winston`)
// [ ] 4. Send appropriate status codes for each error:
//       - `400` for bad requests (e.g., invalid data sent by the client)
//       - `401` for unauthorized access (e.g., missing/invalid token)
//       - `404` for not found errors (e.g., resource not found)
//       - `500` for server errors (unexpected issues)
// [ ] 5. Add support for detailed error messages (optional):
//       - For development, you can return full error details (stack trace) to help debugging
//       - For production, ensure sensitive information (e.g., stack trace) is not exposed to the client
// [ ] 6. Test the error handler to ensure:
//       - It correctly handles different types of errors (validation, database, server errors)
//       - It responds with the correct status code and message
//       - It doesn’t leak sensitive information in production
