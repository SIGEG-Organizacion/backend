import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySlotSchema.index(
  { adminId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: false }
);

availabilitySlotSchema.virtual("startDateTime").get(function () {
  const day = this.date.toISOString().split("T")[0];
  return new Date(`${day}T${this.startTime}:00`);
});
availabilitySlotSchema.virtual("endDateTime").get(function () {
  const day = this.date.toISOString().split("T")[0];
  return new Date(`${day}T${this.endTime}:00`);
});

const AvailabilitySlot = mongoose.model(
  "AvailabilitySlot",
  availabilitySlotSchema
);
export default AvailabilitySlot;
