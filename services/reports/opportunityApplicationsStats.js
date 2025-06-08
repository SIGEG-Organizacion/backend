import Opportunity from "../../models/opportunityModel.js";
import Interest from "../../models/interestModel.js";
import Report from "../../models/reportModel.js";
import {
  filterByCompany,
  filterByDateRange,
  filterByOpportunity,
  filterByStatus,
  filterByStudentStatus,
} from "./reportServiceUtils.js";

const calculateInterestStats = async (opportunityFilter, opportunityUuid) => {
  const opportunities = await Opportunity.find(opportunityFilter);
  const opportunityUuids = opportunities.map((op) => op.uuid);

  const interestCounts = await Interest.aggregate([
    {
      $lookup: {
        from: "opportunities",
        localField: "opportunityId",
        foreignField: "_id",
        as: "opportunity",
      },
    },
    { $unwind: "$opportunity" },
    { $match: { "opportunity.uuid": { $in: opportunityUuids } } },
    { $group: { _id: "$opportunityId", count: { $sum: 1 } } },
  ]);

  const totalInterests = interestCounts.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const avgInterests =
    opportunities.length > 0 ? totalInterests / opportunities.length : 0;

  let description = "";
  if (opportunityUuid && opportunities.length === 1) {
    description = opportunities[0].description;
  }

  return {
    totalOpportunities: opportunities.length,
    totalInterests,
    avgInterestsPerOpportunity: avgInterests,
    description,
    opportunityUuids,
  };
};

export const reportInterestStats = async (
  opportunityUuid,
  startDate,
  endDate,
  forStudents,
  status,
  companyName
) => {
  try {
    let filter = {};
    filter = filterByStatus(filter, status);
    filter = filterByStudentStatus(filter, forStudents);
    filter = filterByOpportunity(filter, opportunityUuid); // Now uses uuid
    filter = await filterByCompany(filter, companyName);
    filter = filterByDateRange(filter, startDate, endDate);

    const stats = await calculateInterestStats(filter, opportunityUuid);

    const report = new Report({
      type: "interets-numbers",
      data: {
        ...stats,
        filters: {
          companyName,
          startDate,
          endDate,
          forStudents,
          opportunityUuid,
        },
      },
      generationDate: new Date(),
    });

    await report.save();
    return report;
  } catch (error) {
    console.error("Error in reportInterestStats:", error.message, error.stack);
    throw error;
  }
};
