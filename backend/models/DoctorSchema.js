import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  ticketPrice: { type: Number },
  role: {
    type: String,
  },

  // Fields for doctors only
  specialization: { type: String },
  qualifications: {
    type: Array,
  },

  experiences: {
    type: Array,
  },

  bio: { type: String, maxLength: 50 },
  about: { type: String },
  timeSlots: { type: Array },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review"}],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpires: { type: Date },

  // 🛡️ Seguridad 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  twoFactorRecoveryCodes: [{ type: String, select: false }],

  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
});

export default mongoose.model("Doctor", DoctorSchema);
