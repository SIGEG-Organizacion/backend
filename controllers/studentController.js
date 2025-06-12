import User from "../models/userModel.js";
import Interest from "../models/interestModel.js";

export const getStudentApplications = async (req, res, next) => {
  const { email } = req.params;
  try {
    const userId = User.findOne({ email }).select("_id")?._id;
    if (!userId) throw AppError.notFound("Invalid request: not found");
    const interests = await Interest.find({ userId })
      .populate("opportunityId")
      .select("-_id -_companyId");
    res.status(200).json({ applications: interests });
  } catch (err) {
    next(err);
  }
};
