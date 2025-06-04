// models/reportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ["opportunity-numbers"], required: true }, // "Application Report", "User Report", etc.
  data: { type: Object, required: true }, // Data of the report (can store any JSON structure)
  generationDate: { type: Date, required: true },
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
