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
  // 1) Buscar la solicitud
  const reqDoc = await MeetingRequest.findOne({ _id: requestId, adminId });
  if (!reqDoc) throw AppError.notFound("Request no encontrada");

  // 2) Email de la compañía (invitado)
  const comp = await Company.findById(reqDoc.companyId).populate(
    "userId",
    "email"
  );
  const companyEmail = comp.userId.email;

  // 3) Construir los ISO con sufijo -06:00 (Costa Rica)
  const dateStr = reqDoc.requestDate.toISOString().split("T")[0];
  const tzOffset = "-06:00";
  const startIso = `${dateStr}T${reqDoc.startTime}:00${tzOffset}`;
  const endIso = `${dateStr}T${reqDoc.endTime}:00${tzOffset}`;

  // 4) Crear el evento en Google Calendar
  const event = await createGoogleEvent(adminId, {
    summary: `Reunión con ${companyEmail}${
      reqDoc.description ? ` – ${reqDoc.description}` : ""
    }`,
    start: startIso,
    end: endIso,
    attendees: [companyEmail],
  });

  return {
    eventId: event.id,
    summary: event.summary,
    start: startIso,
    end: endIso,
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
