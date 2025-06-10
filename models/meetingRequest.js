import mongoose from "mongoose";

const meetingRequestSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    startTime: {
      type: String, // formato: 'HH:mm', ej: '09:00'
      required: true,
    },
    endTime: {
      type: String, // formato: 'HH:mm', ej: '13:30'
      required: true,
    },
    calendarProvider: {
      type: String,
      enum: ["google", "microsoft"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingRequest = mongoose.model("MeetingRequest", meetingRequestSchema);
export default MeetingRequest;
