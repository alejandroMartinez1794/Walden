import crypto from 'crypto';
import Transaction from '../models/TransactionSchema.js';
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import sendEmail from '../utils/emailService.js';

// Constantes de Wompi (Deberían estar en .env)
const WOMPI_PUB_KEY = process.env.WOMPI_PUB_KEY || 'pub_test_QmO3mF0123456789ABCDEFGHIJKLMN'; // Reemplazar con tu llave pública real
const WOMPI_PRV_KEY = process.env.WOMPI_PRV_KEY || 'prv_test_Hj54s20123456789ABCDEFGHIJKLMN'; // Reemplazar con tu llave privada real
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_secret'; // Secreto de integridad
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || 'test_events_secret'; // Secreto para webhooks

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
                publicKey: WOMPI_PUB_KEY
            }
        });

    } catch (error) {
        console.error('Error generando firma Wompi:', error);
        res.status(500).json({ message: 'Error interno generando pago' });
    }
};

// 2. Webhook "Nivel Dios" (Donde Wompi nos avisa qué pasó)
export const wompiWebhook = async (req, res) => {
    try {
        const { event, data, signature, timestamp, environment } = req.body;
        
        console.log('🔔 Wompi Webhook Recibido:', event);

        // 🛡️ 1. Validación de Seguridad (Verificar que Wompi es quien dice ser)
        // Firma del evento: SHA256(timestamp + events_secret) (Simplificado, revisar doc oficial para checksum exacto)
        // Wompi envía 'checksum' en el objeto signature. Debemos validarlo.
        // checksum = SHA256(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + events_secret)
        
        const transactionData = data.transaction;
        const localChecksumString = `${transactionData.id}${transactionData.status}${transactionData.amount_in_cents}${timestamp}${WOMPI_EVENTS_SECRET}`;
        const localChecksum = crypto.createHash('sha256').update(localChecksumString).digest('hex');

        if (signature.checksum !== localChecksum) {
             console.error('🚨 ALERTA DE SEGURIDAD: Firma de webhook inválida. Posible ataque.');
             return res.status(400).json({ message: 'Invalid signature' });
        }

        const reference = transactionData.reference;
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            console.error(`Transacción no encontrada: ${reference}`);
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
                    subject: '¡Pago Exitoso! Tu cita está confirmada - Psiconepsis',
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
                    subject: 'Nueva Cita Pagada 💰 - Psiconepsis',
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
        console.error('Error en Wompi Webhook:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
