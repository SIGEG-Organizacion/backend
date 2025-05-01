// To-Do List for /controllers/companyController.js
// ==================================================
//
// [ ] 1. Import necessary modules:
//       - Company model (from '../models/companyModel.js')
//       - Opportunity model (from '../models/opportunityModel.js')
//       - Flyer model (from '../models/flyerModel.js')
// [ ] 2. Implement createOpportunity method to:
//       - Validate incoming request data (description, requirements, benefits, mode, deadline)
//       - Check if the company exists (using companyId)
//       - Create a new opportunity and save it to the database
//       - Respond with the newly created opportunity data
// [ ] 3. Implement updateOpportunity method to:
//       - Validate incoming request data (check opportunity exists)
//       - Update opportunity fields (description, requirements, benefits, mode, deadline)
//       - Save the updated opportunity to the database
//       - Respond with the updated opportunity data
// [ ] 4. Implement deleteOpportunity method to:
//       - Check if the opportunity exists
//       - Delete the opportunity from the database
//       - Respond with a success message indicating deletion
// [ ] 5. Implement createFlyer method to:
//       - Validate incoming request data (content, format)
//       - Create a flyer for the company (e.g., based on a specific opportunity)
//       - Save the flyer document to the database
//       - Respond with the created flyer data
// [ ] 6. Implement getOpportunities method to:
//       - Retrieve all opportunities for a specific company
//       - Return the list of opportunities
// [ ] 7. Add error handling for:
//       - Invalid data
//       - Missing or incorrect fields in requests
//       - Opportunity or company not found
// [ ] 8. Test the controller functions to ensure:
//       - Creating, updating, and deleting opportunities works as expected
//       - Creating and retrieving flyers works correctly
//       - Error handling provides proper responses
