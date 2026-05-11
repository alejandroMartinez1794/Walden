import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    set: (value) => {
      if (value === true) return "approved";
      if (value === false) return "pending";
      return value;
    },
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

DoctorSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password || this.password.startsWith("$2")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

export default mongoose.model("Doctor", DoctorSchema);
