// To-Do List for /middlewares/validationMiddleware.js
// ===================================================
//
// [ ] 1. Import necessary modules:
//       - Validation libraries (e.g., express-validator, joi, or custom validation logic)
// [ ] 2. Create a middleware function to validate incoming request data:
//       - Use a validation library (e.g., `express-validator`) to check if required fields are provided in the request body
//       - Validate data types and formats (e.g., email, password, dates, numbers)
//       - Handle validation errors and send appropriate responses (e.g., 400 Bad Request with error messages)
// [ ] 3. Implement validation for common fields:
//       - User registration: Check if `email` is valid and unique, `password` meets the required length, etc.
//       - Opportunity creation: Validate required fields (e.g., `description`, `requirements`, `deadline`)
// [ ] 4. Create helper functions to format and handle error responses from validation:
//       - Collect all validation errors and send a detailed error message to the client
// [ ] 5. Apply the validation middleware to routes:
//       - Use the validation middleware in the relevant routes (e.g., `POST /register`, `POST /create-opportunity`)
// [ ] 6. Test the middleware to ensure:
//       - Incoming requests are properly validated
//       - Invalid or incomplete data returns appropriate error messages
//       - Routes that require validation only proceed if validation passes

export const validateOpportunity = (req, res, next) => {
    const { title, description, deadline, modality, companyId } = req.body;
  
    if (!title || !description || !deadline || !modality || !companyId) {
      return res.status(400).json({
        error: "Todos los campos obligatorios (title, description, deadline, modality, companyId) deben estar presentes.",
      });
    }
  
    // Validación de formato de fecha
    if (isNaN(Date.parse(deadline))) {
      return res.status(400).json({ error: "Formato de fecha no válido para 'deadline'." });
    }
  
    next();
  };
  
  export const validateApplication = (req, res, next) => {
    const { opportunityId } = req.body;
    const studentId = req.user?._id; // se asume que viene del token
  
    if (!opportunityId) {
      return res.status(400).json({ error: "Falta el campo 'opportunityId'." });
    }
  
    if (!studentId) {
      return res.status(400).json({ error: "No se pudo identificar al estudiante desde el token." });
    }
  
    next();
  };  