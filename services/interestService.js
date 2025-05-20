import { AppError } from "../utils/AppError.js";
import Interest from "../models/interestModel.js";
import Company from "../models/companyModel.js";

export const createInterest = async (userId, uuid) => {
  const opportunityId = Company.findOne({ uuid }).select("_id")?._id;
  if (!opportunityId) throw AppError.notFound("Invalid request: not found");
  const existing = await Interest.findOne({
    userId: userId,
    opportunityId: opportunityId,
  });
  if (existing) throw AppError.conflict("Invalid request: already marked");
  const interest = new Interest({ user: userId, opportunity: opportunityId });
  await interest.save();
  return interest;
};

export const removeInterest = async (userId, uuid) => {
  const opportunityId = Company.findOne({ uuid }).select("_id")?._id;
  if (!opportunityId) throw AppError.notFound("Invalid request: not found");
  const deleted = await Interest.findOneAndDelete({
    user: userId,
    opportunity: opportunityId,
  });
  if (!deleted) return AppError.conflict("Invalid request: nterest not found");
};
