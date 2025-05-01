// To-Do List for /routes/companyRoutes.js
// =======================================
//
// [ ] 1. Import necessary modules:
//       - Express router
//       - Company controller methods (createOpportunity, updateOpportunity, deleteOpportunity, createFlyer, getOpportunities)
// [ ] 2. Define the routes for company-related actions:
//       - POST /create-opportunity: Call the createOpportunity method from companyController to create a new opportunity
//       - PUT /update-opportunity/:id: Call the updateOpportunity method from companyController to update an existing opportunity
//       - DELETE /delete-opportunity/:id: Call the deleteOpportunity method from companyController to delete an opportunity
//       - POST /create-flyer: Call the createFlyer method from companyController to create a flyer for an opportunity
//       - GET /opportunities: Call the getOpportunities method from companyController to list all opportunities for a company
// [ ] 3. Add validation middleware for incoming requests:
//       - Ensure required fields are provided (e.g., description, companyId, etc.)
//       - Validate company authentication (via JWT token)
// [ ] 4. Add error handling for:
//       - Missing or invalid data in the request
//       - Failed operations (e.g., unable to create/update opportunity, delete failure)
//       - Opportunity or company not found
// [ ] 5. Test the routes to ensure:
//       - Opportunities can be created, updated, and deleted as expected
//       - Flyers can be created and retrieved successfully
//       - Proper responses and status codes are returned on success/failure
