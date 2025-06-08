import { AppError } from "../utils/AppError.js";
import Interest from "../models/interestModel.js";
import Opportunity from "../models/opportunityModel.js";
import User from "../models/userModel.js";

export const createInterest = async (userId, uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists) throw AppError.notFound("Invalid request");
  if (opportunityExists.status == "closed")
    throw AppError.badRequest("Invalid request");
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
  const opportunity = await Opportunity.findOne({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Opportunity not found");
  }
  const deletedInterest = await Interest.findOneAndDelete({
    userId: userId,
    opportunityId: opportunity._id,
  });
  if (!deletedInterest) {
    throw AppError.notFound(
      "No interest record found for this user and opportunity"
    );
  }
  return deletedInterest;
};

export const listInterestByStudent = async (studentMail) => {
  const studentExists = await User.findOne({ email: studentMail });
  if (!studentExists) {
    throw AppError.notFound("Not found");
  }

  const interests = await Interest.find({ userId: studentExists._id })
    .populate({
      path: "opportunityId",
      select: "companyId deadline description mode contact",
      populate: {
        path: "companyId",
        select: "name",
      },
    })
    .populate({
      path: "userId",
      select: "name contactNumber email",
    })
    .select("-__v -_id -createdAt");

  return interests.map((interest) => ({
    companyName: interest.opportunityId.companyId.name,
    deadline: interest.opportunityId.deadline,
    description: interest.opportunityId.description,
    mode: interest.opportunityId.mode,
    contact: interest.opportunityId.contact,
    userName: interest.userId.name,
    userContact: interest.userId.contactNumber,
    userEmail: interest.userId.email,
  }));
};

export const listInterestByOpportunity = async (uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists) {
    throw AppError.notFound("Not found");
  }

  const interests = await Interest.find({
    opportunityId: opportunityExists._id,
  })
    .populate({
      path: "opportunityId",
      select: "companyId deadline description mode contact",
      populate: {
        path: "companyId",
        select: "name",
      },
    })
    .populate({
      path: "userId",
      select: "name contactNumber email",
    })
    .select("-__v -_id -createdAt");

  return interests.map((interest) => ({
    companyName: interest.opportunityId.companyId.name,
    deadline: interest.opportunityId.deadline,
    description: interest.opportunityId.description,
    mode: interest.opportunityId.mode,
    contact: interest.opportunityId.contact,
    userName: interest.userId.name,
    userContact: interest.userId.contactNumber,
    userEmail: interest.userId.email,
  }));
};
