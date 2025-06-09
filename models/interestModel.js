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

// Middleware para eliminar los intereses cuando la oportunidad se elimine
interestSchema.pre('deleteMany', async function(next) {
  try {
    const result = await this.model.find({ opportunityId: this._conditions.opportunityId });
    if (result.length > 0) {
      await this.model.deleteMany({ opportunityId: this._conditions.opportunityId });
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Interest = mongoose.model("Interest", interestSchema);
export default Interest;
