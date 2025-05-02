// models/userModel.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password should be at least 6 characters long"], // Password length validation
  },
  role: { type: String, enum: ["student", "company", "admin"], required: true },
});

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    // Duplicate email error (11000 is the MongoDB code for duplicate key error)
    next(new Error("Email already exists"));
  } else {
    next(error); // Pass the error to the next middleware
  }
});

userSchema.pre("save", async function (next) {
  const user = this;

  // If the email is being modified or is new, check if it already exists in the database
  if (this.isModified("email") || this.isNew) {
    const existingUser = await mongoose
      .model("User")
      .findOne({ email: user.email });
    if (existingUser) {
      const error = new Error("Email already exists");
      return next(error); // If email exists, throw error
    }
  }
  next(); // Proceed with saving if no error
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10); // Generate a salt
      this.password = await bcrypt.hash(this.password, salt); // Hash the password
    } catch (error) {
      return next(error); // Pass any error to the next middleware
    }
  }
  next(); // Proceed to save the user
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Compare the hashes
};

userSchema.methods.validateEmailFormat = function () {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(this.email);
};

const User = mongoose.model("User", userSchema);

export default User;
