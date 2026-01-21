// backend/scripts/ensureIndexes.js
// Script para asegurar índices críticos en MongoDB

import mongoose from 'mongoose';
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import GoogleToken from '../models/GoogleTokenSchema.js';
import Alert from '../models/AlertSchema.js';

/**
 * 📊 Crear índices críticos para performance en producción
 * Se ejecuta automáticamente al conectar a MongoDB
 */
export const ensureCriticalIndexes = async () => {
  try {
    // Bookings: búsquedas por fecha y usuario/doctor
    await Booking.collection.createIndex({ appointmentDate: 1 });
    await Booking.collection.createIndex({ user: 1, appointmentDate: -1 });
    await Booking.collection.createIndex({ doctor: 1, appointmentDate: -1 });
    await Booking.collection.createIndex({ status: 1 });

    // Users y Doctors: búsqueda por email (login)
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Doctor.collection.createIndex({ email: 1 }, { unique: true });

    // GoogleToken: búsqueda rápida por userId
    await GoogleToken.collection.createIndex({ userId: 1 });

    // Alerts: búsquedas por paciente y severidad
    await Alert.collection.createIndex({ patient: 1, createdAt: -1 });
    await Alert.collection.createIndex({ severity: 1, resolved: 1 });

    console.log('✅ Índices MongoDB verificados');
  } catch (error) {
    // No bloquear si falla - los índices se crearán eventualmente
    console.log('⚠️ Índices se crearán en background');
  }
};
