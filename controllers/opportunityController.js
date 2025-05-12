import Opportunity from "../models/opportunityModel.js";
import Company from "../models/companyModel.js";
import Student from "../models/studentModel.js";

export const createPublication = async (req, res) => {
  const {
    email,
    description,
    requirements,
    benefits,
    mode,
    deadline,
    contact,
  } = req.body;

  // Validate required fields
  if (
    !companyId ||
    !description ||
    !requirements ||
    !benefits ||
    !mode ||
    !deadline ||
    !contact
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found." });
    }

    const opportunity = new Opportunity({
      companyId,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      contact,
    });

    await opportunity.save();
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
    return res
      .status(400)
      .json({ error: "opportunityId is required in URL params" });
  }

  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    // update only the provided fields
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
    return res
      .status(400)
      .json({ error: "opportunityId is required in URL params" });
  }

  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    await opportunity.deleteOne();
    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOpportunities = async (req, res) => {
  const { companyId } = req.query;

  try {
    let query = {};
    if (companyId) {
      query.companyId = companyId;
      const companyExists = await Company.exists({ _id: companyId });
      if (!companyExists) {
        return res.status(404).json({ error: "Company not found" });
      }
    }

    const opportunities = await Opportunity.find(query).populate(
      "companyId",
      "name sector"
    );
    res.status(200).json({ opportunities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOpportunityById = async (req, res) => {
  const { opportunityId } = req.params;

  if (!opportunityId) {
    return res
      .status(400)
      .json({ error: "opportunityId is required in URL params" });
  }

  try {
    const opportunity = await Opportunity.findById(opportunityId)
      .populate("companyId", "name sector")
      .populate("applications", "userId major admissionYear");

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.status(200).json({ opportunity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const filterOpportunities = async (req, res) => {
  const { mode, from, to, sector } = req.query;

  try {
    const query = {};

    // by mode
    if (mode) {
      query.mode = mode;
    }

    // by deadline range
    if (from || to) {
      query.deadline = {};
      if (from) query.deadline.$gte = new Date(from);
      if (to) query.deadline.$lte = new Date(to);
    }

    // if sector is specified,
    // match companies with that sector first
    let companyFilter = {};
    if (sector) {
      const companies = await Company.find({ sector }, "_id");
      const companyIds = companies.map((c) => c._id);
      query.companyId = { $in: companyIds };
    }

    const opportunities = await Opportunity.find(query).populate(
      "companyId",
      "name sector"
    );
    res.status(200).json({ opportunities });
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
