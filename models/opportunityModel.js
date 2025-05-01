// models/opportunityModel.js

// To-Do List for /models/opportunityModel.js
// ==========================================
//
// [ ] 1. Import mongoose library
// [ ] 2. Define the opportunity schema with fields:
//       - companyId: ObjectId (required, reference to 'Company' model)
//       - description: String (required)
//       - requirements: String (required)
//       - benefits: String (required)
//       - mode: String (required, e.g., "remote", "on-site", "hybrid")
//       - deadline: Date (required)
//       - contact: String (required)
// [ ] 3. Add a reference to the 'Company' model for the companyId field (populate company data when needed)
// [ ] 4. Add validation for description, requirements, benefits, and contact fields
// [ ] 5. Create a model using mongoose.model() and export the model
// [ ] 6. Add methods to interact with opportunities:
//         - Method to filter opportunities based on mode (remote, on-site)
//         - Method to list opportunities within a certain date range
// [ ] 7. Test the model to ensure it works correctly with Mongoose operations (CRUD)
// [ ] 8. Add any additional utility methods or validation if necessary (e.g., validate deadline format)

import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  }, // Reference to 'companies'
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  benefits: { type: String, required: true },
  mode: { type: String, required: true }, // "remote", "on-site", "hybrid"
  deadline: { type: Date, required: true },
  contact: { type: String, required: true },
});

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
