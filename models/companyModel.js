// models/companyModel.js

// To-Do List for /models/companyModel.js
// ======================================
//
// [ ] 1. Imp3ort mongoose library
// [ ] 2. Define the company schema with fields:
//       - userId: ObjectId (required, reference to 'User' model)
//       - companyName: String (required)
//       - sector: String (required)
//       - address: String (required)
//       - logo: String (optional, URL of the logo)
// [ ] 3. Add a reference to the 'User' model for the userId field (populate user data when needed)
// [ ] 4. Add validation for the companyName, sector, and address fields
// [ ] 5. Create a model using mongoose.model() and export the model
// [ ] 6. Add a method to populate company data with user data (e.g., to get the user profile)
// [ ] 7. Test the model to ensure it works correctly with Mongoose operations (CRUD)
// [ ] 8. Implement a method to get company details along with its user profile (using populate)
// [ ] 9. Add any additional utility methods or validation if necessary (e.g., validate sector)

import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to 'users'
  sector: { type: String, required: true },
  address: { type: String, required: true },
  logo: { type: String }, // URL of the logo
});

const Company = mongoose.model("Company", companySchema);

export default Company;
