// models/opportunityModel.js

import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  }, // Reference to 'companies'

  description: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.trim().length > 0;
      },
      message: "Description cannot be empty",
    },
  },

  requirements: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.trim().length > 0;
      },
      message: "Requirements cannot be empty",
    },
  },

  benefits: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.trim().length > 0;
      },
      message: "Benefits cannot be empty",
    },
  },

  mode: {
    type: String,
    required: true,
    enum: ["remote", "on-site", "hybrid"],
  },

  deadline: {
    type: Date,
    required: true,
  },

  contact: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Simple email validation (can be extended for phone numbers or other formats)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(v);
      },
      message: "Invalid contact email format",
    },
  },

  status: {
    type: String,
    required: true,
    enum: ["pending-aproval", "closed", "open"],
  },
});

opportunitySchema.statics.filterByMode = async function (mode) {
  if (!["remote", "on-site", "hybrid"].includes(mode)) {
    throw new Error("Invalid mode.");
  }
  return this.find({ mode: mode });
};

opportunitySchema.statics.filterByStatus = async function (mode) {
  if (!["pending-aproval", "closed", "open"].includes(mode)) {
    throw new Error("Invalid status.");
  }
  return this.find({ mode: mode });
};

opportunitySchema.statics.listByDateRange = async function (
  startDate,
  endDate
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error("Start date cannot be after end date.");
  }

  return this.find({ deadline: { $gte: start, $lte: end } });
};

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
