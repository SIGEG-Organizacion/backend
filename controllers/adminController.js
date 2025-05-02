import User from "../models/userModel.js";
import Report from "../models/reportModel.js";

export const approveUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required in URL params" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.status = "approved";
    await user.save();

    res.status(200).json({ message: "User approved successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateReport = async (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Report type is required" });
  }

  try {
    let data = [];
    let summary = "";

    if (type === "student applications") {
      // Example: count total student applications
      const totalApplications = await User.aggregate([
        { $match: { role: "student" } },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "userId",
            as: "studentInfo",
          },
        },
        { $unwind: "$studentInfo" },
        { $project: { applications: "$studentInfo.applications" } },
      ]);

      const count = totalApplications.reduce(
        (sum, u) => sum + (u.applications?.length || 0),
        0
      );

      data = { totalApplications: count };
      summary = `Total student applications: ${count}`;
    } else if (type === "user activities") {
      const totalUsers = await User.countDocuments();
      const approvedUsers = await User.countDocuments({ status: "approved" });

      data = { totalUsers, approvedUsers };
      summary = `Users: ${totalUsers}, Approved: ${approvedUsers}`;
    } else {
      return res.status(400).json({ error: "Unsupported report type" });
    }

    const report = new Report({
      type,
      summary,
      data,
      generatedAt: new Date(),
    });

    await report.save();

    res.status(201).json({ message: "Report generated successfully", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  const { role, status } = req.query;

  try {
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-password"); // Exclude passwords
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReports = async (req, res) => {
  const { type, from, to } = req.query;

  try {
    const filter = {};

    if (type) filter.type = type;

    if (from || to) {
      filter.generatedAt = {};
      if (from) filter.generatedAt.$gte = new Date(from);
      if (to) filter.generatedAt.$lte = new Date(to);
    }

    const reports = await Report.find(filter).sort({ generatedAt: -1 });

    res.status(200).json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
