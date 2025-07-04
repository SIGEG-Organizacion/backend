//services/opportunityService.js
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Opportunity from "../models/opportunityModel.js";
import Company from "../models/companyModel.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/userModel.js";
import Flyer from "../models/flyerModel.js";
import { createFlyer } from "./flyerService.js";
import Interest from "../models/interestModel.js";

export const createOpportunity = async (
  userId,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  email,
  forStudents
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
    email,
    status: "pending-approval",
    uuid: uuidv4(),
    forStudents,
  });

  await opportunity.save();
  return opportunity;
};

export const updateOpportunityFields = async (
  uuid,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  email,
  status,
  forStudents
  // logoUrl eliminado
) => {
  const opportunity = await Opportunity.findOne({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Not Found: opportunity  doesnt exists");
  }
  // update only the provided fields
  if (description) opportunity.description = description;
  if (requirements) {
    opportunity.requirements = requirements;
    opportunity.markModified("requirements");
  }
  if (benefits) {
    opportunity.benefits = benefits;
    opportunity.markModified("benefits");
  }
  if (mode) opportunity.mode = mode;
  if (deadline) opportunity.deadline = deadline;
  if (email) opportunity.email = email;
  if (status) {
    if (status === "pending-approval") {
      const session = await mongoose.startSession();
      session.startTransaction();
      await Interest.deleteMany({ opportunityId: opportunity._id }).session(
        session
      );
      await session.commitTransaction();
      session.endSession();
    }
    opportunity.status = status;
    const flyer = await Flyer.findOne({ opportunityId: opportunity._id });
    if (!flyer) throw AppError.notFound("Flyer not found");
    flyer.status = status === "open" ? "active" : "inactive";
    await flyer.save();
  }
  if (typeof forStudents === "boolean") {
    opportunity.forStudents = forStudents;
  }
  // No permitir cambio de logoUrl en update
  // Regenerar el flyer sólo si cambió contenido relevante
  const contentChanged = [
    description,
    requirements,
    benefits,
    mode,
    deadline,
    forStudents,
  ].some((x) => x !== undefined);
  const updated = await opportunity.save();
  if (contentChanged) {
    const oldFlyer = await Flyer.findOne({ opportunityId: opportunity._id });
    if (!oldFlyer) throw AppError.notFound("Flyer not found");
    const newFlyer = await createFlyer(
      opportunity._id,
      oldFlyer.format,
      opportunity.logoUrl
    );
    opportunity.flyerUrl = newFlyer.url;
    await opportunity.save();
  }
  return updated;
};

export const deleteOpportunity = async (uuid) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Buscar la oportunidad por UUID
    const opportunity = await Opportunity.findOne({ uuid }).session(session);
    if (!opportunity) {
      throw AppError.notFound("Opportunity not found");
    }

    // Eliminar todos los intereses relacionados
    await Interest.deleteMany({ opportunityId: opportunity._id }).session(
      session
    );

    // Eliminar el flyer relacionado, si existe
    const flyer = await Flyer.findOne({
      opportunityId: opportunity._id,
    }).session(session);
    if (flyer) {
      await flyer.deleteOne().session(session);
    }

    // Eliminar la oportunidad
    await opportunity.deleteOne().session(session);

    // Confirmar transacción
    await session.commitTransaction();
    session.endSession();

    return {
      message:
        "Opportunity and related interests and flyer deleted successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error during opportunity deletion: " + error.message);
  }
};

export const listOpportunitiesWithName = async (company_name) => {
  const user = await User.findOne({ name: company_name }, { _id: 1 });
  if (!user) {
    throw AppError.notFound("Not Found: user doesn't exist");
  }

  const company = await Company.findOne({ userId: user._id });
  if (!company) {
    throw AppError.notFound("Not Found: company doesn't exist");
  }

  const opportunities = await Opportunity.find({ companyId: company._id })
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: {
        path: "userId",
        select: "name -_id",
      },
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
  console.log("Opportunity flyer:", opportunity.flyerUrl);
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
