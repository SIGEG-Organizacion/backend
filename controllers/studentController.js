//controllers/studentController.js
import User from "../models/userModel.js";
import Interest from "../models/interestModel.js";

export const getStudentApplications = async (req, res, next) => {
  const { email } = req.params;
  try {
    const userId = User.findOne({ email }).select("_id")?._id;
    if (!userId) throw AppError.notFound("Invalid request: not found");
    const interests = await Interest.find({ userId })
      .populate("opportunityId")
      .select("-_id -_companyId");
    res.status(200).json({ applications: interests });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  const { email } = req.params;

  try {
    const student = await Student.findOne({ "userId.email": email });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Interest.deleteMany({ userId: student.userId });

    await student.remove();

    res.status(200).json({ message: "Student and related interests deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const markStudentAsGraduated = async (req, res, next) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.graduated = true;
    
    await Interest.deleteMany({ userId: student.userId });

    await student.remove(); 

    // Enviar respuesta
    res.status(200).json({
      message: "Student marked as graduated and removed successfully",
      student,
    });
  } catch (err) {
    next(err);
  }
};
