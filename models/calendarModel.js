import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64"); // Debe tener 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

function decrypt(encrypted) {
  const [ivStr, data] = encrypted.split(":");
  const iv = Buffer.from(ivStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const calendarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "microsoft"],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      get: decrypt,
      set: encrypt,
    },
    refreshToken: {
      type: String,
      //required: true,
      get: decrypt,
      set: encrypt,
    },
    tokenExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const Calendar = mongoose.model("Calendar", calendarSchema);
export default Calendar;
