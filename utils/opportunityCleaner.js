import cron from "node-cron";
import Opportunity from "../models/opportunityModel.js";

const cleanupExpiredOpportunities = async () => {
  try {
    const now = new Date();
    const result = await Opportunity.deleteMany({
      deadline: { $lt: now },
    });

    console.log(`Deleted ${result.deletedCount} expired opportunities`);
  } catch (error) {
    console.error("Error cleaning up expired opportunities:", error);
  }
};

// Schedule the job to run every day at midnight
const startOpportunityCleanupJob = () => {
  cron.schedule("0 0 * * *", cleanupExpiredOpportunities, {
    scheduled: true,
    timezone: "America/Costa_Rica",
  });
};

export default startOpportunityCleanupJob;
