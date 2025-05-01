// models/userModel.js

// To-Do List for /models/userModel.js
// ==================================
//
// [ ] 1. Import mongoose library
// [ ] 2. Define the user schema with fields:
//       - name: String (required)
//       - email: String (required, unique)
//       - password: String (required)
//       - role: String (required, enum: ["student", "company", "admin"])
// [ ] 3. Add validation for the email field (unique)
// [ ] 4. Add password hashing using bcryptjs before saving a user
// [ ] 5. Define a method to compare the entered password with the stored hashed password
// [ ] 6. Create a model using mongoose.model() and export the model
// [ ] 7. Add any additional utility methods or validation if necessary (like email format validation)
// [ ] 8. Test the model to ensure it works correctly with Mongoose operations (CRUD)

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "company", "admin"], required: true },
});

const User = mongoose.model("User", userSchema);

export default User;
