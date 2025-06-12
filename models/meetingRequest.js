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

    // —— Nueva propiedad: fecha solicitada ——
    requestDate: {
      type: Date,
      required: true, // opcional: solo si siempre se envía
    },

    startTime: {
      type: String, // 'HH:mm'
      required: true,
    },
    endTime: {
      type: String, // 'HH:mm'
      required: true,
    },

    calendarProvider: {
      type: String,
      enum: ["google", "microsoft"],
      required: true,
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingRequest = mongoose.model("MeetingRequest", meetingRequestSchema);
export default MeetingRequest;
