import Calendar from "../../models/calendarModel.js";
import { google } from "googleapis";
import { oauth2Client } from "../../config/googleClient.js";
import { AppError } from "../../utils/AppError.js";

async function getAuthClient(userId) {
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

export const saveGoogleTokens = async (userId, tokens) => {
  let rec = await Calendar.findOne({ userId, provider: "google" });
  if (!rec) rec = new Calendar({ userId, provider: "google" });

  rec.accessToken = tokens.access_token;
  rec.refreshToken = tokens.refresh_token;
  rec.tokenExpiry = tokens.expiry_date;
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
  const body = {
    summary,
    start: { dateTime: start },
    end: { dateTime: end },
    attendees: attendees.map((email) => ({ email })),
  };
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: body,
  });
  return res.data;
};
