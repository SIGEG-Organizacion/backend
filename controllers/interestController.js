// controllers/interestController.js
import Interest from "../models/interestModel.js";
import {
  createInterest,
  listInterestByOpportunity,
  listInterestByMail,
  removeInterest,
} from "../services/interestService.js";

export const markInterest = async (req, res, next) => {
  const { uuid } = req.body;
  const userId = req.user._id;
  try {
    await createInterest(userId, uuid);
    res.status(201).json({ message: "Interest marked" });
  } catch (err) {
    next(err);
  }
};

export const unmarkInterest = async (req, res, next) => {
  const { uuid } = req.params;
  const userId = req.user._id;
  try {
    await removeInterest(userId, uuid);
    res.status(200).json({ message: "Interest removed" });
  } catch (err) {
    next(err);
  }
};

export const getUserInterests = async (req, res) => {
  const userId = req.user._id;

  try {
    const interests = await Interest.find({ userId })

      .populate({
        path: "opportunityId",
        select: "companyId deadline description mode contact uuid",
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
        select: "name contactNumber email role",
      })
      .select("-__v -_id -createdAt");

    const formattedInterests = interests.map((interest) => ({
      uuid: interest.opportunityId.uuid,
      companyName: interest.opportunityId.companyId.userId.name,
      deadline: interest.opportunityId.deadline,
      description: interest.opportunityId.description,
      mode: interest.opportunityId.mode,
      contact: interest.opportunityId.contact,
      userName: interest.userId.name,
      userContact: interest.userId.contactNumber,
      userEmail: interest.userId.email,
      userRole: interest.userId.role,
    }));
    res.json(formattedInterests);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};

export const getInterestByMail = async (req, res) => {
  const { mail } = req.params;
  try {
    const interests = await listInterestByMail(mail);
    res.status(200).json({ interests });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};

export const getInterestByOpportunity = async (req, res) => {
  const { uuid } = req.params;
  console.log(uuid);
  try {
    const interests = await listInterestByOpportunity(uuid);
    res.status(200).json({ interests });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};
