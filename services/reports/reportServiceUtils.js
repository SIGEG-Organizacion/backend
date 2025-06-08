import Company from "../../models/companyModel.js";
import User from "../../models/userModel.js";
import { AppError } from "../../utils/AppError.js";

export const filterByCompany = async (filter, companyName) => {
  if (!companyName) return filter;

  const user = await User.findOne({ name: companyName });
  if (!user) throw AppError.notFound("Company not found");

  const company = await Company.findOne({ userId: user._id });
  if (!company) throw AppError.notFound("Company record not found");

  return { ...filter, companyId: company._id };
};

export const filterByDateRange = (filter, startDate, endDate) => {
  if (!startDate && !endDate) return filter;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  return { ...filter, createdAt: dateFilter };
};

export const filterByStudentStatus = (filter, forStudents) => {
  if (forStudents === undefined) return filter;
  return { ...filter, forStudents };
};

export const filterByOpportunity = (filter, uuid) => {
  if (!uuid) return filter;
  return { ...filter, uuid: uuid };
};

export const filterByStatus = (filter, status) => {
  if (!status) return filter;
  return { ...filter, status };
};

export const filterOutPendingApproval = (filter) => ({
  ...filter,
  status: { $ne: "pending-approval" },
});
