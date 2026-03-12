/**
 * 🧪 SETUP DE TESTS
 * 
 * Configuración global para todos los tests
 * 
 * Se ejecuta antes de cada suite de tests
 */

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE_TIME = '15d';
process.env.MONGO_URL = process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/basileia-test';

// Helpers globales
global.generateMongoId = () => {
  return '507f1f77bcf86cd799439011'; // ObjectId válido de MongoDB
};

global.generateInvalidMongoId = () => {
  return 'invalid-id-123';
};

// Cleanup después de cada test
afterEach(() => {
  // Limpiar cualquier estado si es necesario
});

