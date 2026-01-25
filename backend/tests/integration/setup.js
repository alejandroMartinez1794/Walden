/**
 * 🔧 INTEGRATION TESTS SETUP
 * 
 * Configuración global para tests de integración
 * 
 * ¿Qué hacen estos tests?
 * - Prueban endpoints completos (request → database → response)
 * - Usan MongoDB de prueba (en memoria o test DB)
 * - Verifican flujos end-to-end
 * 
 * Diferencias con unit tests:
 * - Unit: Validan schemas (datos → validación)
 * - Integration: Validan APIs (HTTP → controller → DB → response)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

let mongoServer;

/**
 * Setup: Conectar a MongoDB en memoria ANTES de todos los tests
 * 
 * ¿Por qué MongoDB en memoria?
 * - Rápido (no escribe a disco)
 * - Aislado (no contamina DB real)
 * - Limpio (se borra al terminar)
 */
export const setupTestDB = async () => {
  // Crear servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger'
    },
    binary: {
      downloadDir: './mongodb-binaries'
    }
  });
  const uri = mongoServer.getUri();

  // Conectar mongoose
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

/**
 * Teardown: Desconectar y limpiar DESPUÉS de todos los tests
 */
export const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Limpiar DB entre tests individuales
 * 
 * ¿Por qué limpiar entre tests?
 * - Cada test debe ser independiente
 * - No debe haber contaminación de datos
 * - Resultados deben ser reproducibles
 */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Helpers para crear usuarios de prueba
 */
export const createTestUser = async (User, overrides = {}) => {
  const defaultUser = {
    name: 'Test Patient',
    email: 'patient@test.com',
    password: 'TestUserPass123!@#',
    phone: 600000000,
    role: 'paciente',
    ...overrides
  };

  const user = await User.create(defaultUser);
  return user;
};

export const createTestDoctor = async (Doctor, overrides = {}) => {
  const defaultDoctor = {
    name: 'Dr. Test Doctor',
    email: 'doctor@test.com',
    password: 'TestDoctorPass123!@#',
    phone: 600000001,
    role: 'doctor',
    specialization: 'Psicologia',
    ticketPrice: 50,
    bio: 'Test doctor bio',
    isApproved: true,
    ...overrides
  };

  const doctor = await Doctor.create(defaultDoctor);
  return doctor;
};

/**
 * Helper para generar JWT token de prueba
 */
export const generateTestToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET_KEY || 'test-secret-key',
    { expiresIn: '15d' }
  );
};
