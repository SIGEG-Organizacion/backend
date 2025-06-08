import {
  filterByCompany,
  filterByDateRange,
  filterByStudentStatus,
} from "./reportServiceUtils.js";

import Opportunity from "../../models/opportunityModel.js";
import Report from "../../models/reportModel.js";

const groupByTimePeriod = async (filter, groupBy) => {
  if (!groupBy) {
    const count = await Opportunity.countDocuments(filter);
    return { total: count };
  }

  const aggregationPipeline = [];

  if (Object.keys(filter).length > 0) {
    aggregationPipeline.push({ $match: filter });
  }

  const groupFormat = {
    _id: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
      ...(groupBy === "day" && { day: { $dayOfMonth: "$createdAt" } }),
    },
    count: { $sum: 1 },
  };

  aggregationPipeline.push({ $group: groupFormat });

  const sortCriteria = {
    "_id.year": 1,
    "_id.month": 1,
    ...(groupBy === "day" && { "_id.day": 1 }),
  };
  aggregationPipeline.push({ $sort: sortCriteria });

  aggregationPipeline.push({
    $project: {
      _id: 0,
      date: {
        $dateToString: {
          format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              ...(groupBy === "day" && { day: "$_id.day" }),
            },
          },
        },
      },
      count: 1,
    },
  });

  const results = await Opportunity.aggregate(aggregationPipeline);
  return {
    groupBy,
    dataPoints: results,
    total: results.reduce((sum, item) => sum + item.count, 0),
  };
};

export const reportOpportunitiesNumbers = async (
  startDate,
  endDate,
  companyName,
  forStudents,
  groupBy
) => {
  try {
    if (groupBy && !["day", "month", null].includes(groupBy)) {
      throw new Error('groupBy must be "day", "month", or null');
    }

    let filter = {};

    filter = await filterByCompany(filter, companyName);
    filter = filterByDateRange(filter, startDate, endDate);
    filter = filterByStudentStatus(filter, forStudents);

    if (Object.keys(filter).length === 0) {
      console.warn("No filters applied. Processing all opportunities.");
    }

    const groupedData = await groupByTimePeriod(filter, groupBy);

    const report = new Report({
      type: "opportunity-numbers",
      data: {
        ...groupedData,
        filters: {
          companyName,
          startDate,
          endDate,
          forStudents,
        },
      },
      generationDate: new Date(),
    });

    await report.save();
    return report;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
