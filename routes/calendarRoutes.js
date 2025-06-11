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
} from "../controllers/calendarController.js";
import {
  listGoogleEvents,
  saveGoogleTokens,
} from "../services/calendar/googleCalendarService.js";
import { google } from "googleapis";

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
      include_granted_scopes: true,
      prompt: "consent",
      //redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      state: JSON.stringify({ user: req.user }),
    });
    console.log("Url generado es:", url);
    res.redirect(url);
  }
);

router.get("/google/callback", async (req, res, next) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Missing code or state");
  let payload;
  try {
    payload = JSON.parse(state);
  } catch {
    return res.status(400).send("Invalid state");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoRes = await oauth2.userinfo.get();
    //const googleEmail = userInfoRes.data.email;

    await saveGoogleTokens(payload.user._id, "em000rodov@gmail.com", tokens);

    res.send("conected");
  } catch (err) {
    next(err);
  }
});

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
