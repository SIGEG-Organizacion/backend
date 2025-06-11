import Calendar from "../../models/calendarModel.js";
import User from "../../models/userModel.js";
import { google } from "googleapis";
import { oauth2Client } from "../../config/googleClient.js";
import { AppError } from "../../utils/AppError.js";
import { v4 as uuidv4 } from "uuid";

export async function getAuthClient(userId) {
  const rec = await Calendar.findOne({ userId, provider: "google" });
  if (!rec) throw AppError.unauthorized("Credentials not found");

  oauth2Client.setCredentials({
    access_token: rec.accessToken,
    refresh_token: rec.refreshToken,
    expiry_date: rec.tokenExpiry,
  });

  if (rec.tokenExpiry.getTime() <= Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      rec.accessToken = credentials.access_token;
      rec.tokenExpiry = credentials.expiry_date;
      await rec.save();

      oauth2Client.setCredentials(credentials);
    } catch (refreshErr) {
      throw AppError.unauthorized("No se pudo refrescar el access token");
    }
  }

  return oauth2Client;
}

export const saveGoogleTokens = async (userId, googleEmail, tokens) => {
  let rec = await Calendar.findOne({
    userId,
    email: googleEmail,
    provider: "google",
  });
  if (!rec) {
    rec = new Calendar({ userId, email: googleEmail, provider: "google" });
    console.log("new calendar");
  }

  // Always update the access token + expiry
  rec.accessToken = tokens.access_token;
  rec.tokenExpiry = tokens.expiry_date;

  // Only update refreshToken if Google actually returned one
  if (tokens.refresh_token) {
    rec.refreshToken = tokens.refresh_token;
  }

  console.log("saving...");
  await rec.save();
};

export const listGoogleEvents = async (userId) => {
  const auth = await getAuthClient(userId);
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items;
};

export const createGoogleEvent = async (
  userId,
  { summary, start, end, attendees = [] }
) => {
  const auth = await getAuthClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  // Email y nombre del organizador
  const calRec = await Calendar.findOne({ userId, provider: "google" }).select(
    "email"
  );
  if (!calRec) throw AppError.notFound("Calendar record not found");
  const organizerEmail = calRec.email;

  const admin = await User.findById(userId).select("name");
  if (!admin) throw AppError.notFound("Admin user not found");

  // 1) Verificar solapamientos
  const existing = await calendar.events.list({
    calendarId: "primary",
    timeMin: start,
    timeMax: end,
    singleEvents: true,
    orderBy: "startTime",
  });
  if ((existing.data.items || []).length > 0) {
    throw AppError.conflict("Ya existe un evento en ese horario");
  }

  // 2) Crear el evento con Meet y notificaciones
  const eventBody = {
    summary,
    description: `Reunión agendada por ${admin.name}`,
    organizer: { email: organizerEmail, displayName: admin.name },
    start: { dateTime: start, timeZone: "America/Costa_Rica" },
    end: { dateTime: end, timeZone: "America/Costa_Rica" },
    attendees: [
      {
        email: organizerEmail,
        displayName: admin.name,
        responseStatus: "accepted",
      },
      ...attendees.map((email) => ({ email })),
    ],
    conferenceData: {
      createRequest: {
        requestId: uuidv4(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 15 },
        { method: "email", minutes: 30 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: eventBody,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  return res.data;
};
