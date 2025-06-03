import { AppError } from "../utils/AppError.js";
import Interest from "../models/interestModel.js";
import Company from "../models/companyModel.js";
import { ieNoOpen } from "helmet";
import Opportunity from "../models/opportunityModel.js";
import User from "../models/userModel.js";

export const createInterest = async (userId, uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists)
    throw AppError.notFound("Invalid request: not found here");
  const existing = await Interest.findOne({
    userId: userId,
    opportunityId: opportunityExists._id,
  });
  if (existing) throw AppError.conflict("Invalid request: already marked");
  const interest = new Interest({
    userId: userId,
    opportunityId: opportunityExists._id,
  });
  await interest.save();
};

export const removeInterest = async (userId, uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists)
    throw AppError.notFound("Invalid request: not found here");
  const interest = await Interest.findOne({
    user: userId,
    opportunityId: opportunityExists._id,
  });
  console.log(interest);
  const deleted = await Interest.findOneAndDelete({
    userId: userId,
    opportunityId: opportunityExists._id,
  });
  console.log(deleted);
  if (!deleted) throw AppError.conflict("Invalid request: interest not found");
};

export const listInterestByStudent = async (studentMail) => {
  const studentExists = await User.findOne({ email: studentMail });
  if (!studentExists) {
    throw AppError.notFound("Not found");
  }
  const interests = await Interest.find({ userId: studentExists._id })
    .populate({
      path: "opportunityId",
      select: "-_id -companyId",
    })
    .select("-__v -_id -userId -companyId");
  return interests;
};

export const listInterestByOportunity = async (uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists) {
    throw AppError.notFound("Not found");
  }
  const interest = await Interest.find({
    opportunityId: opportunityExists._id,
  })
    .populate({
      path: "opportunityId",
      select: "-_id -companyId",
    })
    .select("-__v -_id -userId -companyId");
  return interest;
};
