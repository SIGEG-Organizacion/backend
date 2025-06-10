import {
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  listAvailabilitySlotsByAdmin,
} from "../services/calendar/availabilitySlotService.js";

import {
  createMeetingRequest,
  deleteMeetingRequest,
  acceptMeetingRequest,
  listRequests,
} from "../services/calendar/requestsService.js";

export const createSlot = async (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  const adminId = req.user._id;

  try {
    const slot = await createAvailabilitySlot(
      adminId,
      date,
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
  const { date, startTime, endTime } = req.body ?? {};
  const adminId = req.user._id;

  try {
    const updatedSlot = await updateAvailabilitySlot(adminId, slotId, {
      date,
      startTime,
      endTime,
    });
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
  const userEmail = req.query.email;

  try {
    const slots = await listAvailabilitySlotsByAdmin(userEmail);
    res.status(200).json({ slots });
  } catch (err) {
    next(err);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const {
      adminEmail,
      requestDate,
      startTime,
      endTime,
      calendarProvider,
      description,
    } = req.body;
    const companyUserId = req.user._id;

    const request = await createMeetingRequest(
      companyUserId,
      adminEmail,
      requestDate,
      startTime,
      endTime,
      calendarProvider,
      description
    );

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
};

export const denyRequest = async (req, res, next) => {
  const requestId = req.params.requestId;
  const adminId = req.user._id;

  try {
    await deleteMeetingRequest(adminId, requestId);
    res.status(200).json({ message: "Request denied and deleted" });
  } catch (err) {
    next(err);
  }
};

export const approveRequest = async (req, res, next) => {
  const requestId = req.params.requestId;
  const adminId = req.user._id;

  try {
    const details = await acceptMeetingRequest(adminId, requestId);
    await deleteMeetingRequest(adminId, requestId);
    res.status(200).json({ message: "Request approved", details });
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    const isAdminRole = role === "adminLink" || role === "vadminTFG";
    const filterKey = isAdminRole ? "adminId" : "companyId";

    const requests = await listRequests({ [filterKey]: userId });
    res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
};
