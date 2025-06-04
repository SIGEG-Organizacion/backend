import Report from "../models/reportModel.js";
import { reportOpportunitiesNumbers } from "../services/reportService.js";

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
