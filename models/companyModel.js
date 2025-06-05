// models/companyModel.js

import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to 'users'
  sector: { type: String, required: true },
  address: { type: String, required: true },
  logoUrl: { type: String }, // URL of the logo
});

const Company = mongoose.model("Company", companySchema);

export default Company;
