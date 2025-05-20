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

import { AppError } from "../utils/AppError.js";
import Opportunity from "../models/opportunityModel.js";
import Company from "../models/companyModel.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/userModel.js";
import Flyer from "../models/flyerModel.js";

export const createOpportunity = async (
  userId,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  contact
) => {
  const opportunityExists = await Opportunity.findOne({
    description: description,
  });
  if (opportunityExists) {
    throw AppError.conflict("Conflict: Opportunity already exists");
  }
  const companyExists = await Company.findOne({ userId });
  if (!companyExists) {
    throw AppError.notFound("Not Found: Company doesnt exists");
  }
  const opportunity = new Opportunity({
    companyId: companyExists._id,
    description,
    requirements,
    benefits,
    mode,
    deadline: new Date(deadline),
    contact,
    status: "pending-aproval",
    uuid: uuidv4(),
  });

  await opportunity.save();
  return opportunity.toObject();
};

export const updateOpportunityFields = async (
  uuid,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  contact,
  status
) => {
  const opportunity = await Opportunity.findOne({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Not Found: opportunity  doesnt exists");
  }
  // update only the provided fields
  if (description) opportunity.description = description;
  if (requirements) opportunity.requirements = requirements;
  if (benefits) opportunity.benefits = benefits;
  if (mode) opportunity.mode = mode;
  if (deadline) opportunity.deadline = deadline;
  if (contact) opportunity.contact = contact;
  if (status) {
    opportunity.status = status;
    //update flyer status to active/inactive to reflect the opportunity status
  }
  const updated = await opportunity.save();
  return updated;
};

export const deleteOpportunity = async (uuid) => {
  const opportunity = await Opportunity.findOneAndDelete({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Not Found: opportunity  doesnt exists");
  }
  const flyer = await Flyer.findOne({ opportunityId: opportunity._id });
  if (flyer) {
    await flyer.deleteOne();
  }
};

export const listOpportunitiesWithName = async (company_name) => {
  let query = {};
  const userExists = await User.findOne({ name: company_name }, { id_: 1 });
  if (!userExists) {
    throw AppError.notFound("Not Found: user  doesnt exists");
  }
  const companyExists = await Company.exists({ userId: userExists._id });
  if (!companyExists) {
    throw AppError.notFound("Not Found: company  doesnt exists");
  }
  const opportunities = await Opportunity.find(query)
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: { path: "userId", select: "name -_id" },
    })
    .select("-_id");
  return opportunities;
};

export const getOpportunityService = async (uuid) => {
  const opportunity = await Opportunity.findOne({ uuid })
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: { path: "userId", select: "name -_id" },
    })
    .select("-_id");
  if (!opportunity) {
    throw AppError.notFound("Opportunity not found");
  }
  return opportunity;
};

export const getOpportunitiesFiltered = async (mode, from, to, sector) => {
  const query = {};
  if (mode) {
    query.mode = mode;
  }
  if (from || to) {
    query.deadline = {};
    if (from) query.deadline.$gte = new Date(from);
    if (to) query.deadline.$lte = new Date(to);
  }
  if (sector) {
    const companies = await Company.find({ sector }, "_id");
    const companyIds = companies.map((c) => c._id);
    query.companyId = { $in: companyIds };
  }
  const opportunities = await Opportunity.find(query)
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: { path: "userId", select: "name -_id" },
    })
    .select("-_id");
  return opportunities;
};

export const createFlyer = async (opportunityId, format) => {
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    throw AppError.notFound("Opportunity not found");
  }
  const flyer = await Flyer.create({
    opportunityId,
    status: "inactive",
    format,
  });
  return flyer;
};
