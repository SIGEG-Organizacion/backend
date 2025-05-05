// controllers/interestController.js
import Interest from "../models/interestModel.js";

export const markInterest = async (req, res) => {
  const { opportunityId } = req.body;
  const userId = req.user._id;

  try {
    const existing = await Interest.findOne({ user: userId, opportunity: opportunityId });
    if (existing) return res.status(400).json({ message: "Already marked" });

    const interest = new Interest({ user: userId, opportunity: opportunityId });
    await interest.save();
    res.status(201).json({ message: "Interest marked", interest });
  } catch (err) {
    res.status(500).json({ error: "Error marking interest" });
  }
};

export const unmarkInterest = async (req, res) => {
  const { opportunityId } = req.params;
  const userId = req.user._id;

  try {
    const deleted = await Interest.findOneAndDelete({ user: userId, opportunity: opportunityId });
    if (!deleted) return res.status(404).json({ message: "Interest not found" });

    res.json({ message: "Interest removed" });
  } catch (err) {
    res.status(500).json({ error: "Error unmarking interest" });
  }
};

export const getUserInterests = async (req, res) => {
  const userId = req.user._id;

  try {
    const interests = await Interest.find({ user: userId }).populate("opportunity");
    res.json({ interests });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving interests" });
  }
};
