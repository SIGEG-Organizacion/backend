import User from "../models/userModel.js";
import Company from "../models/companyModel.js";

export const getCompanyByEmail = async (email) => {
  const companies = await User.aggregate([
    {
      $lookup: {
        from: "Users",
        localField: "id",
        foreignField: "_id",
        as: "matches",
      },
    },
    {
      $match: {
        "matches.email": email,
      },
    },
    {
      $limit: 1,
    },
  ]);
  if (length(result) > 1)
    throw AppError.conflict("Multiple companies match email.");
  if (length(result) == 0) throw AppError.notFound("Company not found.");

  const company = result[0];
  return company.toObject();
};
