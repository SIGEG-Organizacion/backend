// models/flyerModel.js
import mongoose from "mongoose";
const flyerSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Oportunity",
    required: true,
  }, // Reference to 'companies'
  content: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
  }, // "active", "inactive"
  format: {
    type: String,
    required: true,
    enum: ["PDF", "JPG"],
  }, // "PDF", "Image", etc.
  url: {
  type: String,
  required: false,
}
});

const Flyer = mongoose.model("Flyer", flyerSchema);

export default Flyer;
