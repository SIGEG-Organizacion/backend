import express from "express";
import {
  createSlotValidator,
  updateSlotValidator,
  deleteSlotValidator,
  listSlotsValidator,
  createRequestValidator,
  requestIdParamValidator,
} from "../validators/calendarValidator.js";
import { oauth2Client } from "../config/googleClient.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";
import {
  createSlot,
  updateSlot,
  deleteSlot,
  listSlots,
  createRequest,
  denyRequest,
  approveRequest,
  getRequests,
  saveGoogleTokens,
  listGoogleEvents,
} from "../controllers/calendarController.js";

const router = express.Router();

router.get(
  "/google/auth",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.events.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
      prompt: "consent",
    });
    res.redirect(url);
  }
);

router.get(
  "/google/callback",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  async (req, res, next) => {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      await saveGoogleTokens(req.user._id, tokens);
      res.send("Google Calendar conectado correctamente!");
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/google/events",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  async (req, res, next) => {
    try {
      const events = await listGoogleEvents(req.user._id);
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/availabilitySlots",
  protect,
  authorizeRoles("adminLink", "vadminTFG", "company"),
  validateRequest(listSlotsValidator),
  listSlots
);

router.post(
  "/availabilitySlots",
  protect,
  authorizeRoles("adminLink", "vadminTFG"),
  validateRequest(createSlotValidator),
  createSlot
);
router.delete(
  "/availabilitySlots/:slotId",
  protect,
  validateRequest(deleteSlotValidator),
  authorizeRoles("adminLink", "vadminTFG"),
  deleteSlot
);
router.put(
  "/availabilitySlots/:slotId",
  protect,
  validateRequest(updateSlotValidator),
  authorizeRoles("adminLink", "vadminTFG"),
  updateSlot
);

//companies
router.post(
  "/request",
  protect,
  validateRequest(createRequestValidator),
  authorizeRoles("company"),
  createRequest
);

//admins
router.delete(
  "/request/:requestId",
  protect,
  validateRequest(requestIdParamValidator),
  authorizeRoles("adminLink", "vadminTFG"),
  denyRequest
);
router.put(
  "/request/:requestId/approve",
  protect,
  validateRequest(requestIdParamValidator),
  authorizeRoles("adminLink", "vadminTFG"),
  approveRequest
);

//for both:
router.get(
  "/request",
  protect,
  authorizeRoles("company", "adminLink", "vadminTFG"),
  getRequests
);

export default router;
