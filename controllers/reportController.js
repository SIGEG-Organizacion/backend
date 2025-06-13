//controllers/reportController.js
import { reportOpportunitiesNumbers } from "../services/reports/opportunityNumbersStats.js";
import { reportOpportunityStats } from "../services/reports/opportunityStatusStats.js";
import { reportInterestStats } from "../services/reports/opportunityApplicationsStats.js";
import { reportUserStats } from "../services/reports/usersNumbersStats.js";

export const generateReportOpportunitiesNumbers = async (req, res, next) => {
  const { startDate, endDate, companyName, groupBy } = req.query;

  let forStudents = false; 
  if (req.user.role === "adminTFG") {
    forStudents = true; 
  }

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
  const { startDate, endDate, companyName, groupBy, status } = req.query;

  let forStudents = false;
  if (req.user.role === "adminTFG") {
    forStudents = true; 
  }

  try {
    const report = await reportOpportunityStats(
      startDate,
      endDate,
      companyName,
      status,
      forStudents, 
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
  const { startDate, endDate, status, companyName, uuid } = req.query;


  let forStudents = false;
  if (req.user.role === "adminTFG") {
    forStudents = true; 
  }

  try {
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
      forStudents, // Filtro por forStudents determinado por el rol
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

