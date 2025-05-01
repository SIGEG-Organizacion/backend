// models/flyerModel.js
import mongoose from "mongoose";

const flyerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  }, // Reference to 'companies'
  content: { type: String, required: true },
  status: { type: String, required: true }, // "active", "inactive"
  format: { type: String, required: true }, // "PDF", "Image", etc.
});

const Flyer = mongoose.model("Flyer", flyerSchema);

export default Flyer;
