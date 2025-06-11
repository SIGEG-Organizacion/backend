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

router.get("/google/callback", async (req, res, next) => {
  console.log("callback… query got:", req.query);
  console.log("Local server time:", new Date().toISOString());
  const { code } = req.query;

  try {
    // 1) Intercambiar code por tokens, asegurándote de usar redirect_uri
    const response = await oauth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    // 2) Extraer los tokens correctamente
    const tokens = response.tokens;
    console.log("TOKENS:", tokens);
    console.log("USER:", req.user.name);

    // 3) Guardar en BD
    await saveGoogleTokens(req.user._id, tokens);

    // 4) Responder al navegador
    res.send("Google Calendar conectado correctamente!");
  } catch (err) {
    // Imprime el error completo para depurar
    console.error("Error in callback handler:", err.response?.data || err);
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
