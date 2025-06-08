// controllers/interestController.js
import Interest from "../models/interestModel.js";
import {
  createInterest,
  listInterestByOpportunity,
  listInterestByStudent,
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

    const formattedInterests = interests.map((interest) => ({
      companyName: interest.opportunityId.companyId.name,
      deadline: interest.opportunityId.deadline,
      description: interest.opportunityId.description,
      mode: interest.opportunityId.mode,
      contact: interest.opportunityId.contact,
      userName: interest.userId.name,
      userContact: interest.userId.contactNumber,
      userEmail: interest.userId.email,
    }));

    res.json(formattedInterests);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};

export const getInterestByStudentMail = async (req, res) => {
  const { studentMail } = req.params;
  try {
    const interests = await listInterestByStudent(studentMail);
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
