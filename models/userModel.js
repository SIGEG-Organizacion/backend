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
    minlength: [6, "Password should be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: ["student", "company", "adminTFG", "adminLink", "graduate"],
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+(?:[0-9] ?){6,14}[0-9]$/, "Please enter a valid email address"],
  },
  validated: {
    type: Boolean,
    required: true,
  },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Evita duplicados (correo ya existente)
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Email already exists"));
  } else {
    next(error);
  }
});

// Hash de contraseña antes de guardar (solo si fue modificada)
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});
userSchema.pre("remove", async function (next) {
  try {
    // Eliminar todos los intereses asociados al usuario
    await Interest.deleteMany({ userId: this._id });

    // Eliminar el estudiante si el usuario es un estudiante
    if (this.role === "student") {
      await Student.deleteOne({ userId: this._id });
    }

    // Eliminar la empresa si el usuario es una empresa
    if (this.role === "company") {
      await Company.deleteOne({ userId: this._id });
    }

    next();
  } catch (err) {
    next(err);
  }
});
// Método para comparar contraseña en login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
