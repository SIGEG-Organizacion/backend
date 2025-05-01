// To-Do List for /controllers/opportunityController.js
// =====================================================
//
// [ ] 1. Import necessary modules:
//       - Opportunity model (from '../models/opportunityModel.js')
//       - Company model (from '../models/companyModel.js')
//       - Student model (from '../models/studentModel.js')
// [ ] 2. Implement createOpportunity method to:
//       - Validate incoming request data (companyId, description, requirements, benefits, mode, deadline, contact)
//       - Check if the company exists (validate companyId)
//       - Create a new opportunity and save it to the database
//       - Respond with the created opportunity details
// [ ] 3. Implement updateOpportunity method to:
//       - Validate incoming request data (check opportunityId and ensure data is valid)
//       - Update opportunity fields (description, requirements, benefits, mode, deadline)
//       - Save the updated opportunity to the database
//       - Respond with the updated opportunity details
// [ ] 4. Implement deleteOpportunity method to:
//       - Validate incoming request data (check if opportunityId exists)
//       - Delete the opportunity from the database
//       - Respond with a success message indicating deletion
// [ ] 5. Implement getOpportunities method to:
//       - Retrieve all opportunities from the database (optionally filter by companyId or other parameters)
//       - Populate the necessary fields (e.g., company details)
//       - Return the list of opportunities
// [ ] 6. Implement getOpportunityById method to:
//       - Retrieve a single opportunity by its ID
//       - Populate necessary details (company, applicants)
//       - Return the opportunity details
// [ ] 7. Implement filterOpportunities method to:
//       - Allow filtering opportunities based on specific criteria (e.g., mode, deadline, sector)
//       - Return the filtered list of opportunities
// [ ] 8. Add error handling for:
//       - Missing or invalid data
//       - Opportunity or company not found
//       - Database errors
// [ ] 9. Test the controller functions to ensure:
//       - Creating, updating, and deleting opportunities works as expected
//       - Listing and filtering opportunities works correctly
//       - Error handling provides proper responses
