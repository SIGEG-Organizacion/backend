import {
  filterByCompany,
  filterByDateRange,
  filterByStatus,
  filterByStudentStatus,
} from "./reportServiceUtils.js";

import Report from "../../models/reportModel.js";
import Opportunity from "../../models/opportunityModel.js";

const calculateOpportunityStats = async (filter, groupBy) => {
  const aggregationPipeline = [];

  if (Object.keys(filter).length > 0) {
    aggregationPipeline.push({ $match: filter });
  }

  const groupStage = {
    _id: {
      ...(groupBy && {
        date: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          ...(groupBy === "day" && { day: { $dayOfMonth: "$createdAt" } }),
        },
      }),
      status: "$status",
    },
    count: { $sum: 1 },
  };

  aggregationPipeline.push({ $group: groupStage });

  if (groupBy) {
    aggregationPipeline.push({
      $sort: {
        "_id.date.year": 1,
        "_id.date.month": 1,
        ...(groupBy === "day" && { "_id.date.day": 1 }),
      },
    });
  }

  aggregationPipeline.push({
    $project: {
      _id: 0,
      ...(groupBy && {
        date: {
          $dateToString: {
            format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
            date: {
              $dateFromParts: {
                year: "$_id.date.year",
                month: "$_id.date.month",
                ...(groupBy === "day" && { day: "$_id.date.day" }),
              },
            },
          },
        },
      }),
      status: "$_id.status",
      count: 1,
    },
  });

  const results = await Opportunity.aggregate(aggregationPipeline);
  const total = results.reduce((sum, item) => sum + item.count, 0);
  const averagePerPeriod = groupBy
    ? total / new Set(results.map((item) => item.date)).size
    : total;

  return {
    total,
    average: averagePerPeriod,
    statusDistribution: results,
    ...(groupBy && { groupBy }),
  };
};
export const reportOpportunityStats = async (
  startDate,
  endDate,
  companyName,
  status,
  forStudents,
  groupBy
) => {
  try {
    if (groupBy && !["day", "month"].includes(groupBy)) {
      throw new AppError(
        "Invalid groupBy value. Use 'day', 'month', or null.",
        400
      );
    }

    let filter = {};

    filter = await filterByCompany(filter, companyName);
    filter = filterByDateRange(filter, startDate, endDate);
    filter = filterByStudentStatus(filter, forStudents);
    filter = filterByStatus(filter, status);

    const stats = await calculateOpportunityStats(filter, groupBy);

    const report = new Report({
      type: "opportunity-stats",
      data: {
        ...stats,
        filters: {
          companyName,
          startDate,
          endDate,
          status,
          forStudents,
        },
      },
      generationDate: new Date(),
    });

    await report.save();
    return report;
  } catch (error) {
    console.error("Error generating stats report:", error);
    throw error;
  }
};
