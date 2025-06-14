// models/studentModel.js

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  major: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Major cannot be empty",
    },
  },

  admissionYear: {
    type: Number,
    required: true,
  },

  graduated: {
    type: Boolean,
    default: false, 
  },
});

studentSchema.methods.populateApplications = async function () {
  await this.populate("applications").execPopulate();
  return this.applications;
};

studentSchema.methods.getCurrentAcademicYear = function () {
  const currentYear = new Date().getFullYear();
  const academicYear = currentYear - this.admissionYear + 1;
  return academicYear;
};

studentSchema.methods.updateMajor = async function (newMajor) {
  this.major = newMajor;
  await this.save();
  return this;
};

studentSchema.pre('remove', async function (next) {
  try {
    // Eliminar todos los intereses relacionados con este estudiante
    await Interest.deleteMany({ userId: this.userId });
    next();
  } catch (err) {
    next(err);
  }
});



const Student = mongoose.model("Student", studentSchema);

export default Student;
