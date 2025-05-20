// controllers/interestController.js
import Interest from "../models/interestModel.js";
import { createInterest } from "../services/interestService.js";

export const markInterest = async (req, res, next) => {
  const { uuid } = req.body;
  const userId = req.user._id;
  try {
    const interest = await createInterest(userId, uuid);
    res.status(201).json({ message: "Interest marked", interest });
  } catch (err) {
    next(err);
  }
};

export const unmarkInterest = async (req, res, next) => {
  const { uuid } = req.params;
  const userId = req.user._id;

  try {
    removeInterest(userId, uuid);
    res.json({ message: "Interest removed" });
  } catch (err) {
    res.status(500).json({ error: "Error unmarking interest" });
  }
};

export const getUserInterests = async (req, res) => {
  const userId = req.user._id;

  try {
    const interests = await Interest.find({ userId })
      .populate("opportunityId")
      .select("-_id -_companyId");
    res.json({ interests });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};
