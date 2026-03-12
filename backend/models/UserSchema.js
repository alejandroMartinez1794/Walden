import mongoose from "mongoose";

const microGoalSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const behaviorExperimentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pendiente", "En progreso", "Completado"],
      default: "Pendiente",
    },
    reflection: { type: String, trim: true },
  },
  { _id: false }
);

const schemaHighlightSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    trigger: { type: String, trim: true },
    need: { type: String, trim: true },
    action: { type: String, trim: true },
  },
  { _id: false }
);

const copingTechniqueSchema = new mongoose.Schema(
  {
    technique: { type: String, trim: true },
    cue: { type: String, trim: true },
  },
  { _id: false }
);

const cbtProfileSchema = new mongoose.Schema(
  {
    therapyGoal: { type: String, default: "" },
    lastMood: {
      label: { type: String, default: "" },
      intensity: { type: Number, default: 0 },
      updatedAt: { type: Date },
    },
    abcRecord: {
      trigger: { type: String, default: "" },
      thought: { type: String, default: "" },
      emotion: { type: String, default: "" },
      behavior: { type: String, default: "" },
      reframe: { type: String, default: "" },
    },
    microGoals: { type: [microGoalSchema], default: [] },
    sessionPrompts: { type: [String], default: [] },
    behaviorExperiments: { type: [behaviorExperimentSchema], default: [] },
    schemaHighlights: { type: [schemaHighlightSchema], default: [] },
    copingToolkit: { type: [copingTechniqueSchema], default: [] },
    safetyPlan: {
      signals: { type: [String], default: [] },
      actions: { type: [String], default: [] },
      emergency: { type: String, default: "" },
    },
    insights: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // ✅ Ya no es requerido
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String }, // Puedes renombrarlo a "profilePicture" si prefieres
  role: {
    type: String,
    enum: ["paciente", "admin", "doctor"],
    default: "paciente",
  },
  gender: { type: String },
  bloodType: { type: String },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],

  // ✅ Nuevo campo para saber el origen del usuario
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpires: { type: Date },
  
  // 🛡️ Seguridad 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false }, // Oculto por defecto
  twoFactorRecoveryCodes: [{ type: String, select: false }],

  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  cbtProfile: {
    type: cbtProfileSchema,
    default: () => ({}),
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
