import AvailabilitySlot from "../../models/availabilitySlotModel.js";
import { AppError } from "../../utils/AppError.js";
import User from "../../models/userModel.js";

export const createAvailabilitySlot = async (
  adminId,
  dayOfWeek,
  startTime,
  endTime
) => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes >= endMinutes) {
    throw AppError.badRequest("Start time must be before end time");
  }

  const overlappingSlot = await AvailabilitySlot.findOne({
    adminId,
    dayOfWeek,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });

  if (overlappingSlot) {
    throw AppError.conflict("This time slot overlaps with an existing slot");
  }

  const slot = new AvailabilitySlot({
    adminId,
    dayOfWeek,
    startTime,
    endTime,
  });

  await slot.save();

  return {
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
};

export const updateAvailabilitySlot = async (adminId, slotId, updates) => {
  const slot = await AvailabilitySlot.findOne({
    _id: slotId,
    adminId,
  });

  if (!slot) {
    throw AppError.notFound("Availability slot not found or not yours");
  }

  if (updates.dayOfWeek !== undefined) slot.dayOfWeek = updates.dayOfWeek;
  if (updates.startTime !== undefined) slot.startTime = updates.startTime;
  if (updates.endTime !== undefined) slot.endTime = updates.endTime;

  await slot.save();

  return {
    dayOfWeek: slot.dayOfWeek,
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
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const slots = await AvailabilitySlot.find({ adminId: user._id })
    .select("-_id dayOfWeek startTime endTime createdAt updatedAt")
    .sort({ dayOfWeek: 1, startTime: 1 });

  return slots;
};
