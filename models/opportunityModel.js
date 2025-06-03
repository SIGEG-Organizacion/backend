// models/opportunityModel.js

import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  deadline: {
    type: Date,
    required: true,
  },

  description: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return v.trim().length > 0;
      },
      message: "Description cannot be empty",
    },
  },

  requirements: [
    {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Requirements cannot be empty",
      },
    },
  ],

  benefits: [
    {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Benefits cannot be empty",
      },
    },
  ],

  mode: {
    type: String,
    required: true,
    enum: ["remote", "on-site", "hybrid"],
  },

  contact: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(v);
      },
      message: "Invalid contact email format",
    },
  },

  status: {
    type: String,
    required: true,
    enum: ["pending-approval", "closed", "open"],
  },

  uuid: {
    type: String,
    unique: true,
    required: true,
  },

  // Nuevo campo para guardar la URL del flyer
  flyerUrl: {
    type: String,
    required: false, // No obligatorio, solo se llena después de generar el flyer
  },
});

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
