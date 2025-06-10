import MeetingRequest from "../../models/meetingRequest.js";
import { AppError } from "../../utils/AppError.js";
import User from "../../models/userModel.js";
import Company from "../../models/companyModel.js";
import { createGoogleEvent } from "./googleCalendarService.js";

export const createMeetingRequest = async (
  companyUserId,
  adminEmail,
  requestDate,
  startTime,
  endTime,
  calendarProvider,
  description
) => {
  const admin = await User.findOne({ email: adminEmail }).select("_id");
  if (!admin) {
    throw AppError.notFound("Admin not found");
  }

  const company = await Company.findOne({ userId: companyUserId }).select(
    "_id"
  );
  if (!company) {
    throw AppError.notFound("Company not found for this user");
  }

  const newRequest = new MeetingRequest({
    companyId: company._id,
    adminId: admin._id,
    requestDate: new Date(requestDate),
    startTime,
    endTime,
    calendarProvider,
    description: description || "",
  });

  await newRequest.save();

  return {
    id: newRequest._id.toString(),
    requestDate: newRequest.requestDate.toISOString().split("T")[0],
    startTime: newRequest.startTime,
    endTime: newRequest.endTime,
    calendarProvider: newRequest.calendarProvider,
    description: newRequest.description,
    createdAt: newRequest.createdAt.toISOString(),
    updatedAt: newRequest.updatedAt.toISOString(),
  };
};

export const deleteMeetingRequest = async (adminId, requestId) => {
  const deleted = await MeetingRequest.findOneAndDelete({
    _id: requestId,
    adminId: adminId,
  });
  if (!deleted) throw AppError.notFound("Request not found or not yours");
};

export const acceptMeetingRequest = async (adminId, requestId) => {
  const req = await MeetingRequest.findOne({ _id: requestId, adminId });
  if (!req) throw AppError.notFound("Request no encontrada");

  const comp = await Company.findById(req.companyId).populate(
    "userId",
    "email"
  );
  const companyEmail = comp.userId.email;

  const dateStr = req.requestDate.toISOString().split("T")[0];
  const startDateTime = `${dateStr}T${req.startTime}:00`;
  const endDateTime = `${dateStr}T${req.endTime}:00`;

  const event = await createGoogleEvent(adminId, {
    summary: `Reunión con ${companyEmail}${
      req.description ? ` – ${req.description}` : ""
    }`,
    start: startDateTime,
    end: endDateTime,
    attendees: [companyEmail],
  });

  return {
    eventId: event.id,
    summary: event.summary,
    start: startDateTime,
    end: endDateTime,
  };
};

export const listRequests = async (filter) => {
  const raw = await MeetingRequest.find(filter)
    .select("-__v")
    .sort({ createdAt: -1 })
    .populate({ path: "adminId", select: "name email -_id" })
    .populate({
      path: "companyId",
      select: "-__v -userId -_id",
      populate: { path: "userId", select: "name email -_id" },
    });

  return raw.map((req) => {
    const date = req.requestDate.toISOString().split("T")[0];
    return {
      id: req._id.toString(),
      requestDate: date,
      startTime: req.startTime,
      endTime: req.endTime,
      calendarProvider: req.calendarProvider,
      description: req.description,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      admin: {
        name: req.adminId.name,
        email: req.adminId.email,
      },
      company: {
        name: req.companyId.userId.name,
        email: req.companyId.userId.email,
      },
    };
  });
};
