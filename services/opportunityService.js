// To-Do List for /services/opportunityService.js
// =============================================
//
// [ ] 1. Import necessary modules:
//       - Opportunity model (from '../models/opportunityModel.js')
//       - Company model (from '../models/companyModel.js')
// [ ] 2. Create a function to create a new opportunity:
//       - Validate the input data (e.g., companyId, description, requirements, benefits, mode, deadline)
//       - Check if the company exists (using companyId)
//       - Create a new opportunity and save it to the database
//       - Return the created opportunity details
// [ ] 3. Create a function to update an existing opportunity:
//       - Validate incoming request data (check if opportunityId exists)
//       - Update opportunity fields (description, requirements, benefits, mode, deadline)
//       - Save the updated opportunity to the database
//       - Return the updated opportunity details
// [ ] 4. Create a function to delete an opportunity:
//       - Validate incoming request data (check if opportunityId exists)
//       - Delete the opportunity from the database
//       - Return a success message indicating the opportunity was deleted
// [ ] 5. Create a function to retrieve all opportunities:
//       - Retrieve all opportunities from the database
//       - Optionally filter opportunities based on specific parameters (e.g., companyId, date range, etc.)
//       - Return the list of opportunities
// [ ] 6. Create a function to get a single opportunity by its ID:
//       - Retrieve the opportunity by its ID
//       - Optionally populate related data (e.g., company details)
//       - Return the opportunity details
// [ ] 7. Create a function to filter opportunities based on certain criteria:
//       - Filter opportunities based on parameters (e.g., mode: remote/on-site, deadline, company sector)
//       - Return the filtered list of opportunities
// [ ] 8. Add error handling for:
//       - Missing or invalid data (e.g., missing opportunityId or companyId)
//       - Opportunity not found (when updating or deleting)
//       - Database errors
// [ ] 9. Test the functions to ensure:
//       - Creating, updating, and deleting opportunities works as expected
//       - Retrieving and filtering opportunities works correctly
//       - Proper error handling is in place for each case

import { application } from "express";
import { AppError } from "../utils/AppError.js";
import { getCompanyByEmail } from "../services/companyService.js";

export const createOpportunity = async (
  email,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  contact
) => {
  const company = getCompanyByEmail(email);
  const opportunity = new Opportunity({
    comanyId: company._id,
    description,
    requirements,
    benefits,
    mode,
    deadline,
    contact,
    status: "pending-aproval",
    uuid: uuidv4(),
  });

  await opportunity.save();
  return opportunity.toObject();
};
