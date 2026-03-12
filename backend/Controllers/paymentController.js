import crypto from 'crypto';
import Transaction from '../models/TransactionSchema.js';
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import sendEmail from '../utils/emailService.js';
import logger from '../utils/logger.js';

// Wompi Payment Gateway Configuration (Colombia)
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_EVENT_SECRET = process.env.WOMPI_EVENT_SECRET;

// Validation: Log warning if Wompi not configured
if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY || !WOMPI_INTEGRITY_SECRET || !WOMPI_EVENT_SECRET) {
    logger.warn('Wompi payment gateway not fully configured. Payment features may not work.', {
        hasPublicKey: !!WOMPI_PUBLIC_KEY,
        hasPrivateKey: !!WOMPI_PRIVATE_KEY,
        hasIntegritySecret: !!WOMPI_INTEGRITY_SECRET,
        hasEventSecret: !!WOMPI_EVENT_SECRET
    });
}

// 1. Generar Firma de Integridad (NIVEL DIOS: Seguridad CRÍTICA)
// Wompi requiere: SHA256(reference + amountInCents + currency + integritySecret)
export const generatePaymentSignature = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const user = req.user; // Del middleware authenticate

        if (!amount || !bookingId) {
            return res.status(400).json({ message: 'Faltan datos requeridos (amount, bookingId)' });
        }

        // Referencia única de pago: BOOKING-{id}-{timestamp}
        const reference = `BOOKING-${bookingId}-${Date.now()}`;
        const currency = 'COP';
        // Wompi usa centavos para la firma: 10000 COP -> 1000000 centavos
        const amountInCents = Math.round(amount * 100); 

        // Cadena para firmar
        const signatureString = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
        
        // Hash SHA256
        const integritySignature = crypto.createHash('sha256').update(signatureString).digest('hex');

        // Guardar intención de transacción en DB (Estado: PENDING)
        const newTransaction = new Transaction({
            reference,
            booking: bookingId,
            user: user.id || user._id,
            amount,
            currency,
            status: 'PENDING',
            signature: integritySignature,
            provider: 'WOMPI'
        });

        await newTransaction.save();

        res.status(200).json({
            success: true,
            data: {
                reference,
                integritySignature, // Wompi necesita esto en el frontend
                currency,
                amountInCents,
                publicKey: WOMPI_PUBLIC_KEY
            }
        });

    } catch (error) {
        logger.error('Error generating Wompi payment signature', { 
            error: error.message, 
            stack: error.stack,
            userId: req.user?.id 
        });
        res.status(500).json({ message: 'Error interno generando pago' });
    }
};

// 2. Webhook "Nivel Dios" (Donde Wompi nos avisa qué pasó)
export const wompiWebhook = async (req, res) => {
    try {
        const { event, data, signature, timestamp, environment } = req.body;
        
        logger.info('Wompi webhook received', { event, transactionId: data?.transaction?.id });

        // 🛡️ 1. Validación de Seguridad (Verificar que Wompi es quien dice ser)
        // Firma del evento: SHA256(timestamp + events_secret) (Simplificado, revisar doc oficial para checksum exacto)
        // Wompi envía 'checksum' en el objeto signature. Debemos validarlo.
        // checksum = SHA256(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + events_secret)
        
        const transactionData = data.transaction;
        const localChecksumString = `${transactionData.id}${transactionData.status}${transactionData.amount_in_cents}${timestamp}${WOMPI_EVENT_SECRET}`;
        const localChecksum = crypto.createHash('sha256').update(localChecksumString).digest('hex');

        if (signature.checksum !== localChecksum) {
             logger.error('Wompi webhook signature validation failed - Possible attack', {
                 expectedChecksum: localChecksum,
                 receivedChecksum: signature.checksum,
                 transactionId: transactionData.id
             });
             return res.status(400).json({ message: 'Invalid signature' });
        }

        const reference = transactionData.reference;
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            logger.error('Transaction not found for webhook', { reference });
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Evitar procesar eventos duplicados
        if (transaction.status === transactionData.status) {
            return res.status(200).send('Event already processed');
        }

        // Actualizar estado
        transaction.status = transactionData.status; // APPROVED, DECLINED, VOIDED, ERROR
        transaction.wompiId = transactionData.id;
        transaction.paymentMethod = transactionData.payment_method_type; 
        transaction.updatedAt = new Date();
        
        await transaction.save();

        // 🧠 Lógica de Negocio Automática
        if (transactionData.status === 'APPROVED') {
            const booking = await Booking.findById(transaction.booking).populate('doctor user');
            
            if (booking) {
                booking.isPaid = true;
                booking.status = 'approved'; // Confirmar cita automáticamente
                await booking.save();

                // Notificar al Usuario
                await sendEmail({
                    email: booking.user.email,
                    subject: '¡Pago Exitoso! Tu cita está confirmada - Basileia',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4ade80; border-radius: 8px;">
                            <h2 style="color: #166534;">¡Pago Confirmado! 🎉</h2>
                            <p>Hola <strong>${booking.user.name}</strong>,</p>
                            <p>Hemos recibido tu pago de <strong>$${transaction.amount} COP</strong>.</p>
                            <p>Tu cita con el Dr. <strong>${booking.doctor.name}</strong> ha sido confirmada automáticamente.</p>
                            <p><strong>Referencia:</strong> ${reference}</p>
                            <br>
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/users/profile/me" style="background: #166534; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Mis Citas</a>
                        </div>
                    `
                });

                 // Notificar al Doctor
                 await sendEmail({
                    email: booking.doctor.email,
                    subject: 'Nueva Cita Pagada 💰 - Basileia',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 8px;">
                            <h2 style="color: #1e40af;">¡Nueva Cita Confirmada!</h2>
                            <p>El paciente <strong>${booking.user.name}</strong> ha completado el pago.</p>
                            <p><strong>Fecha:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
                            <br>
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/doctors/profile/me" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir a mi Agenda</a>
                        </div>
                    `
                });
            }
        }

        res.status(200).send('Webhook processed');

    } catch (error) {
        logger.error('Error processing Wompi webhook', { 
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
