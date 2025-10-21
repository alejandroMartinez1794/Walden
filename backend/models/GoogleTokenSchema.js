import mongoose from 'mongoose';

const GoogleTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // o 'Doctor' si el acceso está vinculado al doctor
    required: true,
    unique: true,
  },
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
}, { timestamps: true });

export default mongoose.models.GoogleToken || mongoose.model('GoogleToken', GoogleTokenSchema);
