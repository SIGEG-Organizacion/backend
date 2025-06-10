import {
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  listAvailabilitySlotsByAdmin,
} from "../services/calendar/availabilitySlotService.js";

export const createSlot = async (req, res, next) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  const adminId = req.user._id;

  try {
    const slot = await createAvailabilitySlot(
      adminId,
      dayOfWeek,
      startTime,
      endTime
    );
    res.status(201).json({ slot });
  } catch (err) {
    next(err);
  }
};

export const updateSlot = async (req, res, next) => {
  const { slotId } = req.params;
  const updates = req.body;
  const adminId = req.user._id;

  try {
    const updatedSlot = await updateAvailabilitySlot(adminId, slotId, updates);
    res.status(200).json({ slot: updatedSlot });
  } catch (err) {
    next(err);
  }
};

export const deleteSlot = async (req, res, next) => {
  const { slotId } = req.params;
  const adminId = req.user._id;

  try {
    await deleteAvailabilitySlot(adminId, slotId);
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const listSlots = async (req, res, next) => {
  console.log("fucckyoufuckyoufuckyou");
  const userEmail = req.query.email;

  try {
    const slots = await listAvailabilitySlotsByAdmin(userEmail);
    res.status(200).json({ slots });
  } catch (err) {
    next(err);
  }
};
