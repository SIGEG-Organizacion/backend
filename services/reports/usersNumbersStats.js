import User from "../../models/userModel.js";
import Report from "../../models/reportModel.js";

export const reportUserStats = async (role, validated) => {
  try {
    // Build the filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (validated !== undefined) {
      filter.validated = validated;
    }

    // Get total count
    const totalUsers = await User.countDocuments(filter);

    const report = new Report({
      type: "user-stats",
      data: {
        totalUsers,
        filters: {
          role,
          validated,
        },
      },
      generationDate: new Date(),
    });

    await report.save();
    return report;
  } catch (error) {
    console.error("Error in reportUserStats:", error.message, error.stack);
    throw error;
  }
};
