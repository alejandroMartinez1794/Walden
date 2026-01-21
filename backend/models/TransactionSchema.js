
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true }, // Referencia única del comercio
  wompiId: { type: String }, // ID interno de Wompi (llega en el webhook)
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'COP' },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'], 
    default: 'PENDING' 
  },
  signature: { type: String }, // Firma de integridad generada
  paymentMethod: { type: String }, // CARD, NEQUI, PSE, BANCOLOMBIA_TRANSFER, etc.
  provider: { type: String, default: 'WOMPI' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
