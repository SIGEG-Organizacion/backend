import Opportunity from "../models/opportunityModel.js";
import Company from "../models/companyModel.js";
import {
  createOpportunity,
  listOpportunities,
  updateOpportunityFields,
} from "../services/opportunityService.js";

export const createPublication = async (req, res, next) => {
  const { description, requirements, benefits, mode, deadline, contact } =
    req.body;
  const userId = req.user._id;
  console.log(`Company id is: ${userId}`);
  try {
    const opportunity = await createOpportunity(
      userId,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      contact
    );
    res
      .status(201)
      .json({ message: "Opportunity created successfully", opportunity });
  } catch (err) {
    console.log("Error catched");
    next(err);
  }
};

export const updateOpportunity = async (req, res, next) => {
  const { opportunityUUID } = req.params;
  const {
    description,
    requirements,
    benefits,
    mode,
    deadline,
    contact,
    status,
  } = req.body;

  try {
    const updated = await updateOpportunityFields(
      opportunityUUID,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      contact,
      status
    );
    res.status(200).json({
      message: "Opportunity updated successfully",
      opportunity: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  const { uuid } = req.params;
  try {
    await updateOpportunity(uuid);
    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getOpportunities = async (req, res, next) => {
  const { company_name } = req.query;
  try {
    const opportunities = await listOpportunities(company_name);
    res.status(200).json({ opportunities });
  } catch (err) {
    next(err);
  }
};

export const getOpportunityById = async (req, res, next) => {
  const { opportunityId } = req.params;

  try {
    const opportunity = await getOpportunityByIdService(opportunityId);
    res.status(200).json({ opportunity });
  } catch (err) {
    next(err);
  }
};

export const filterOpportunities = async (req, res, next) => {
  const { mode, from, to, sector } = req.query;

  try {
    const opportunities = await filterOpportunitiesService(
      mode,
      from,
      to,
      sector
    );
    res.status(200).json({ opportunities });
  } catch (err) {
    next(err);
  }
};

export const createFlyer = async (req, res, next) => {
  const { companyId, opportunityId, content, format } = req.body;

  try {
    const flyer = await createFlyerService(
      companyId,
      opportunityId,
      content,
      format
    );
    res.status(201).json({ message: "Flyer created successfully", flyer });
  } catch (err) {
    next(err);
  }
};
