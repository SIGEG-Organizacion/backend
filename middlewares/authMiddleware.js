import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { AppError } from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized("Access denied");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user.validated) {
      next(AppError.forbidden("Access denied 4"));
    } else {
      next();
    }
  } catch (error) {
    throw AppError.forbidden("Access denied 3");
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden("Access denied: insufficient role");
    }
    next();
  };
};
