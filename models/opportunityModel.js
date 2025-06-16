// models/opportunityModel.js

import mongoose from "mongoose";
import Interest from "./interestModel.js"; // Importar el modelo de Interest para eliminar los intereses

const opportunitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
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
  email: {
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
    enum: ["pending-approval", "rejected", "closed", "open"],
  },
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  flyerUrl: {
    // Ahora almacena solo la ruta (key) del archivo en B2, no la URL firmada
    type: String,
    required: false,
    // Ejemplo: 'flyers/flyer_xxx.pdf'
  },
  forStudents: {
    type: Boolean,
    required: true,
  },
  logoUrl: {
    type: String,
    required: false,
  },
});

// Middleware para eliminar los intereses relacionados cuando la oportunidad se elimina
opportunitySchema.pre("remove", async function (next) {
  try {
    await Interest.deleteMany({ opportunityId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
