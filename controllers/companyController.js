import Company from "../models/companyModel.js";
import Opportunity from "../models/opportunityModel.js";
import Flyer from "../models/flyerModel.js";

export const createOpportunity = async (req, res) => {
  const {
    companyId,
    description,
    requirements,
    benefits,
    mode,
    deadline,
    contact,
  } = req.body;

  if (
    !companyId ||
    !description ||
    !requirements ||
    !benefits ||
    !mode ||
    !deadline ||
    !contact
  ) {
    return res.status(400).json({
      error:
        "companyId, description, requirements, benefits, mode, deadline, and contact are required",
    });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const opportunity = await Opportunity.create({
      companyId,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      contact,
    });

    res
      .status(201)
      .json({ message: "Opportunity created successfully", opportunity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOpportunity = async (req, res) => {
  const { opportunityId } = req.params;
  const { description, requirements, benefits, mode, deadline, contact } =
    req.body;

  if (!opportunityId) {
    return res.status(400).json({ error: "opportunityId is required" });
  }
  if (
    !description &&
    !requirements &&
    !benefits &&
    !mode &&
    !deadline &&
    !contact
  ) {
    return res
      .status(400)
      .json({ error: "At least one field to update must be provided" });
  }

  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    if (description) opportunity.description = description;
    if (requirements) opportunity.requirements = requirements;
    if (benefits) opportunity.benefits = benefits;
    if (mode) opportunity.mode = mode;
    if (deadline) opportunity.deadline = deadline;
    if (contact) opportunity.contact = contact;

    const updated = await opportunity.save();

    res.status(200).json({
      message: "Opportunity updated successfully",
      opportunity: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOpportunity = async (req, res) => {
  const { opportunityId } = req.params;

  if (!opportunityId) {
    return res.status(400).json({ error: "opportunityId is required" });
  }

  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    await Opportunity.findByIdAndDelete(opportunityId);

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createFlyer = async (req, res) => {
  const { companyId, opportunityId, content, format } = req.body;

  if (!companyId || !content || !format) {
    return res
      .status(400)
      .json({ error: "companyId, content, and format are required" });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (opportunityId) {
      const opportunity = await Opportunity.findById(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
    }

    const flyer = await Flyer.create({
      companyId,
      opportunityId,
      content,
      format,
    });

    res.status(201).json({ message: "Flyer created successfully", flyer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOpportunities = async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const opportunities = await Opportunity.find({ companyId });

    res.status(200).json({ opportunities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
