// models/flyerModel.js
import mongoose from "mongoose";
const flyerSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  }, // Reference to 'companies'
  content: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
  }, // "active", "inactive", "rejected", "pending-approval"
  format: {
    type: String,
    required: true,
  }, // "PDF", "Image", etc.
  url: {
    type: String,
    required: false,
  },
});

const Flyer = mongoose.model("Flyer", flyerSchema);

export default Flyer;
