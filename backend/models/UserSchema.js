import mongoose from "mongoose";

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
  gender: { type: String, enum: ["Male", "female", "other"] },
  bloodType: { type: String },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],

  // ✅ Nuevo campo para saber el origen del usuario
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
