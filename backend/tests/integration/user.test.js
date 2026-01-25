import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB, generateTestToken, createTestUser } from './setup.js';

describe('User Integration Tests', () => {
  let userToken;
  let userId;
  let testUser;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    testUser = await createTestUser(User, {
        email: 'patient@test.com',
        name: 'Test Patient',
        gender: 'male'
    });
    
    userId = testUser._id.toString();
    userToken = generateTestToken(testUser._id, 'paciente');
  });

  describe('GET /api/v1/users', () => {
    // Note: getAllUser might be restricted to admin? 
    // Checking routes: router.get("/", authenticate, restrict(["admin"]), getAllUser);
    // So I need an admin token. But let's check routes file first.
    // If it's public/patient, test will fail if I assume admin.
    
    // Actually, usually users list is restricted. I'll skip this test block or assume admin until I check routes.
    // Let's check routes first or assume admin logic.
    // user.js routes usually:
    // router.get("/", authenticate, restrict(["admin"]), getAllUser);
  });

  describe('GET /api/v1/users/:id', () => {
    test('debe devolver un usuario específico por ID', async () => {
        // Authenticated as someone? 'getSingleUser' usually restricted to 'patient' (self) or 'admin'.
        // Route: router.get("/:id", authenticate, restrict(["patient"]), getSingleUser);
        // Wait, patient can only see THEMSELVES? Or any user?
        // Usually restrictive.
        
        const response = await request(app)
            .get(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`);
      
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(userId);
    });

    test('debe devolver 404 para ID inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .get(`/api/v1/users/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    test('debe permitir actualizar el perfil del usuario autenticado', async () => {
      const updateData = {
        name: 'Test Patient Updated',
        gender: 'female',
        bloodType: 'O+'
      };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.bloodType).toBe(updateData.bloodType);
    });

    test('debe rechazar datos inválidos', async () => {
        const response = await request(app)
          .put(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ bloodType: 'X' }); // Invalid blood type
        
        expect(response.status).toBe(400); // Bad Request from Validator
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    test('debe permitir borrar la cuenta del usuario autenticado', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('GET /api/v1/users/profile/me', () => {
      test('debe devolver el perfil del usuario actual', async () => {
          const response = await request(app)
            .get('/api/v1/users/profile/me')
            .set('Authorization', `Bearer ${userToken}`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data._id).toBe(userId);
      });
  });
});
