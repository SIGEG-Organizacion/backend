import express from "express";
import { oauth2Client } from "../config/googleClient.js";
import Calendar from "../models/calendarModel.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validatorMiddleware.js";

import {
  createSlotValidator,
  updateSlotValidator,
  deleteSlotValidator,
  listSlotsValidator,
} from "../validators/calendarValidator.js";

import {
  createSlot,
  updateSlot,
  deleteSlot,
  listSlots,
} from "../controllers/calendarController.js";

const router = express.Router();

router.get("/availabilitySlots", async (req, res) => {
  try {
    // Simulate async operation (e.g., database call, network request)
    const result = await new Promise((resolve) => {
      setTimeout(() => {
        console.log("Data fetched!");
        resolve("Data fetched successfully");
      }, 2000); // Simulate 2 seconds delay
    });

    // Send the result as the response
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;

router.get("/google/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    prompt: "consent",
  });
  res.redirect(authUrl);
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    const { userId } = req.user._id;

    console.log(tokens);
    await Calendar.create({
      userId,
      provider: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date,
    });
    oauth2Client.setCredentials(tokens);

    res.send("¡Google Calendar conectado! Ahora puedes leer/crear eventos.");
  } catch (err) {
    next(err);
  }
});

//AvailabilitySlots

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
