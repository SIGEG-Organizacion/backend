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

export const listInterestByMail = async (studentMail) => {
  const studentExists = await User.findOne({ email: studentMail });
  if (!studentExists) {
    throw AppError.notFound("Student not found");
  }

  const interests = await Interest.find({ userId: studentExists._id })
    .populate({
      path: "opportunityId",
      select: "companyId deadline description mode email uuid",
      populate: [
        {
          path: "companyId",
          select: "userId",
          populate: {
            path: "userId",
            select: "name",
          },
        },
      ],
    })
    .populate({
      path: "userId",
      select: "name phone_number email role",
    })
    .select("-__v -_id -createdAt");

  return interests.map((interest) => ({
    uuid: interest.opportunityId.uuid,
    companyName: interest.opportunityId.companyId.userId.name,
    deadline: interest.opportunityId.deadline,
    description: interest.opportunityId.description,
    mode: interest.opportunityId.mode,
    contact: interest.opportunityId.email,
    userName: interest.userId.name,
    userContact: interest.userId.phone_number,
    userEmail: interest.userId.email,
    userRole: interest.userId.role,
  }));
};

export const listInterestByOpportunity = async (uuid) => {
  const opportunityExists = await Opportunity.findOne({ uuid });
  if (!opportunityExists) {
    throw AppError.notFound("Opportunity not found");
  }

  const interests = await Interest.find({
    opportunityId: opportunityExists._id,
  })
    .populate({
      path: "opportunityId",
      select: "companyId deadline description mode email",
      populate: [
        {
          path: "companyId",
          select: "userId",
          populate: {
            path: "userId",
            select: "name",
          },
        },
      ],
    })
    .populate({
      path: "userId",
      select: "name phone_number email role",
    })
    .select("-__v -_id -createdAt");

  return interests.map((interest) => ({
    uuid: opportunityExists.uuid,
    companyName: interest.opportunityId.companyId.userId.name,
    deadline: interest.opportunityId.deadline,
    description: interest.opportunityId.description,
    mode: interest.opportunityId.mode,
    contact: interest.opportunityId.email,
    userName: interest.userId.name,
    userContact: interest.userId.phone_number,
    userEmail: interest.userId.email,
    userRole: interest.userId.role,
  }));
};
