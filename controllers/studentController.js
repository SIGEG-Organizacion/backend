// To-Do List for /controllers/studentController.js
// [ ] 5. Test the controller functions to ensure:
//       - Applying for an opportunity correctly adds the student to the opportunity
//       - Retrieving applications returns the correct list of opportunities
// [ ] 6. Optionally, add methods for:
//       - Updating student profile
//       - Viewing student profile

import Student from "../models/studentModel.js";
import Opportunity from "../models/opportunityModel.js";

export const applyForOpportunity = async (req, res) => {
  const { studentId, opportunityId } = req.body;
  // Validate request data
  if (!studentId || !opportunityId) {
    return res
      .status(400)
      .json({ error: "studentId and opportunityId are required" });
  }
  try {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    // Add student to opportunity applications if not already applied
    if (opportunity.applications.includes(studentId)) {
      return res
        .status(409)
        .json({ error: "Student has already applied to this opportunity" });
    }
    opportunity.applications.push(studentId);
    await opportunity.save();
    res.status(200).json({ message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentApplications = async (req, res) => {
  const { studentId } = req.params;
  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const student = await Student.findById(studentId).populate("applications");
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({ applications: student.applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
