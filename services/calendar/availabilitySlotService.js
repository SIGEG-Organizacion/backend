import AvailabilitySlot from "../../models/availabilitySlotModel.js";
import { AppError } from "../../utils/AppError.js";
import User from "../../models/userModel.js";
import { google } from "googleapis";
import { getAuthClient } from "./googleCalendarService.js";

export const createAvailabilitySlot = async (
  adminId,
  date,
  startTime,
  endTime
) => {
  const slotDate = new Date(date);
  if (isNaN(slotDate)) {
    throw AppError.badRequest("Invalid date format. Use YYYY-MM-DD");
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes >= endMinutes) {
    throw AppError.badRequest("startTime must be before endTime");
  }

  const overlapping = await AvailabilitySlot.findOne({
    adminId,
    date: slotDate,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
  if (overlapping) {
    throw AppError.conflict(
      "This time slot overlaps an existing one on that date"
    );
  }

  const slot = new AvailabilitySlot({
    adminId,
    date: slotDate,
    startTime,
    endTime,
  });
  await slot.save();

  return {
    date: slot.date.toISOString().split("T")[0],
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
};

export const updateAvailabilitySlot = async (adminId, slotId, updates) => {
  const slot = await AvailabilitySlot.findOne({ _id: slotId, adminId });
  if (!slot) {
    throw AppError.notFound("Availability slot not found or not yours");
  }

  if (updates.date) {
    const d = new Date(updates.date);
    if (isNaN(d)) throw AppError.badRequest("Invalid date format");
    slot.date = d;
  }
  if (updates.startTime) slot.startTime = updates.startTime;
  if (updates.endTime) slot.endTime = updates.endTime;

  const [sh, sm] = slot.startTime.split(":").map(Number);
  const [eh, em] = slot.endTime.split(":").map(Number);
  if (sh * 60 + sm >= eh * 60 + em) {
    throw AppError.badRequest("startTime must be before endTime");
  }

  const overlapping = await AvailabilitySlot.findOne({
    adminId,
    date: slot.date,
    _id: { $ne: slotId },
    startTime: { $lt: slot.endTime },
    endTime: { $gt: slot.startTime },
  });
  if (overlapping) {
    throw AppError.conflict(
      "Updated slot overlaps an existing one on that date"
    );
  }

  await slot.save();
  return {
    date: slot.date.toISOString().split("T")[0],
    startTime: slot.startTime,
    endTime: slot.endTime,
    updatedAt: slot.updatedAt,
  };
};

export const deleteAvailabilitySlot = async (adminId, slotId) => {
  const deleted = await AvailabilitySlot.findOneAndDelete({
    _id: slotId,
    adminId,
  });
  if (!deleted) {
    throw AppError.notFound("Availability slot not found or not yours");
  }
};

export const listAvailabilitySlotsByAdmin = async (userEmail) => {
  const user = await User.findOne({ email: userEmail }).select("_id");
  if (!user) throw AppError.notFound("User not found");

  // 2) Trae todos los slots de ese admin
  const slots = await AvailabilitySlot.find({ adminId: user._id })
    .select("date startTime endTime createdAt updatedAt")
    .sort({ date: 1, startTime: 1 });

  if (!slots.length) return [];

  const auth = await getAuthClient(user._id);
  const calendar = google.calendar({ version: "v3", auth });
  const tzOffset = "-06:00";

  const checks = slots.map(async (s) => {
    const day = s.date.toISOString().split("T")[0];
    const startIso = `${day}T${s.startTime}:00${tzOffset}`;
    const endIso = `${day}T${s.endTime}:00${tzOffset}`;

    const resp = await calendar.events.list({
      calendarId: "primary",
      timeMin: startIso,
      timeMax: endIso,
      singleEvents: true,
      orderBy: "startTime",
    });

    const hasConflict = (resp.data.items || []).length > 0;
    return hasConflict ? null : s;
  });

  const results = await Promise.all(checks);
  const freeSlots = results.filter((s) => s !== null);

  return freeSlots.map((s) => {
    const day = s.date.toISOString().split("T")[0];
    return {
      id: s._id.toString(),
      date: day,
      startTime: s.startTime,
      endTime: s.endTime,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  });
};
