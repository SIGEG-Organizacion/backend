import { reportOpportunitiesNumbers } from "../services/reports/opportunityNumbersStats.js";
import { reportOpportunityStats } from "../services/reports/opportunityStatusStats.js";
import { reportInterestStats } from "../services/reports/opportunityApplicationsStats.js";
import { reportUserStats } from "../services/reports/usersNumbersStats.js";

export const generateReportOpportunitiesNumbers = async (req, res, next) => {
  const { startDate, endDate, companyName, groupBy } = req.query; // 'day', 'month', or undefined for no  } =
  const forStudents = req.user.role === "vadminTFG" ? true : false;
  try {
    const report = await reportOpportunitiesNumbers(
      startDate,
      endDate,
      companyName,
      forStudents,
      groupBy
    );
    res.status(200).json({ data: report });
  } catch (err) {
    next(err);
  }
};

export const generateReportOpportunitiesStatus = async (req, res, next) => {
  const { startDate, endDate, companyName, groupBy, status, forStudents } =
    req.query;
  try {
    let forStudensRealValue = forStudents;
    if (req.user.role !== "company") {
      forStudensRealValue = req.user.role === "vadminTFG" ? true : false;
    }
    const report = await reportOpportunityStats(
      startDate,
      endDate,
      companyName,
      status,
      undefined,
      groupBy
    );
    res.status(200).json({ data: report });
  } catch (err) {
    next(err);
  }
};

export const generateReportUsers = async (req, res, next) => {
  const { role, validated } = req.query;
  try {
    const report = await reportUserStats(role, validated);
    res.status(200).json({ data: report });
  } catch (err) {
    next(err);
  }
};

export const generateReportInterest = async (req, res, next) => {
  const { startDate, endDate, status, companyName, forStudents, uuid } =
    req.query;

  try {
    let forStudentsValue;
    if (req.user.role !== "company") {
      forStudentsValue = req.user.role === "vadminTFG";
    }
    if (req.user.role === "company") {
      if (!companyName) {
        return res.status(400).json({
          error: "Invalid request",
        });
      }
      if (req.user.name !== companyName) {
        return res.status(403).json({
          error: "Unauthorized",
        });
      }
    }

    const report = await reportInterestStats(
      uuid,
      startDate,
      endDate,
      undefined,
      status,
      companyName
    );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
