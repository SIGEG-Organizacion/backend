import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dayOfWeek: {
    type: Number, // 0 (domingo) a 6 (sábado)
    min: 0,
    max: 6,
    required: true,
  },
  startTime: {
    type: String, // formato: 'HH:mm', ej: '09:00'
    required: true,
  },
  endTime: {
    type: String, // formato: 'HH:mm', ej: '13:30'
    required: true,
  },
}, {
  timestamps: true
});

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
export default AvailabilitySlot;

