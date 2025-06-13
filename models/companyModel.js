// models/companyModel.js
import mongoose from "mongoose";
import Opportunity from "./opportunityModel.js";

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sector: { type: String, required: true },
  address: { type: String, required: true },
});

companySchema.pre('remove', async function (next) {
  try {
    // Eliminar todas las oportunidades relacionadas con la compañía
    await Opportunity.deleteMany({ companyId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Company = mongoose.model("Company", companySchema);
export default Company;
