// models/interestModel.js
import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

interestSchema.index({ userId: 1, opportunityId: 1 }, { unique: true }); // Para evitar duplicados

const Interest = mongoose.model("Interest", interestSchema);
export default Interest;
