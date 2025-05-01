// models/studentModel.js

// To-Do List for /models/studentModel.js
// =====================================
//
// [ ] 1. Import mongoose library
// [ ] 2. Define the student schema with fields:
//       - userId: ObjectId (required, reference to 'User' model)
//       - major: String (required)
//       - admissionYear: Number (required)
//       - applications: Array (array of ObjectIds, reference to 'Opportunity' model)
// [ ] 3. Add a reference to the 'User' model for the userId field (populate user data when needed)
// [ ] 4. Add validation for the major and admissionYear fields
// [ ] 5. Create a model using mongoose.model() and export the model
// [ ] 6. Add a method to populate applications for a student (to list opportunities the student has applied to)
// [ ] 7. Test the model to ensure it works correctly with Mongoose operations (CRUD)
// [ ] 8. Add any additional utility methods or validation if necessary (e.g., validate admission year)
// [ ] 9. Implement a method to get student details along with their applications (using populate)

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to 'users'
  major: { type: String, required: true },
  admissionYear: { type: Number, required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Opportunity" }], // References to 'opportunities'
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
