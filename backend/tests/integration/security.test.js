/**
 * 🛡️ INTEGRATION TESTS - Security & Compliance (Phase 1)
 * 
 * Tests específicos para verificar nuevas implementaciones de seguridad:
 * - Política de contraseñas robustas (NIST SP 800-63B)
 * - Blacklisting de tokens (Secure Logout)
 * - Logs de auditoría (HIPAA Compliance)
 */

process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import AuditLog from '../../models/AuditLogSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('🛡️ Security Policies', () => {
  
  describe('Password Policy (NIST Compliance)', () => {
    
    test('debe rechazar contraseña corta (< 12 chars)', async () => {
      const userData = {
        name: 'Short Pass User',
        email: 'short@test.com',
        password: 'Str0ng!Pass', // 11 chars
        role: 'paciente'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.message).toMatch(/contraseña/i);
    });

    test('debe rechazar contraseña sin caracteres especiales', async () => {
      const userData = {
        name: 'No Special User',
        email: 'nospecial@test.com',
        password: 'StrongPassword123',
        role: 'paciente'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
    });

    test('debe rechazar contraseña común/débil', async () => {
      const userData = {
        name: 'Common User',
        email: 'common@test.com',
        password: 'Password123!', // En lista común y contiene palabra 'password'
        role: 'paciente'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
        
      expect(response.body.message).toMatch(/común|segura|débil|Contraseña débil/i);
    });

    test('debe aceptar contraseña robusta válida', async () => {
      const userData = {
        name: 'Valid User',
        email: 'valid@test.com',
        password: 'VerySecurePass123!@#',
        role: 'paciente'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('Secure Logout & Token Blacklisting', () => {
    
    test('debe invalidar token después de logout', async () => {
      // 1. Registrar y Login
      const userData = {
        name: 'Logout User',
        email: 'logout@test.com',
        password: 'VerySecurePass123!@#',
        role: 'paciente'
      };

      await request(app).post('/api/v1/auth/register').send(userData);
      
      // Auto-verify email
      const user = await User.findOne({ email: userData.email });
      user.emailVerified = true;
      await user.save();

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: userData.password });
        
      const token = loginRes.body.token;
      expect(token).toBeDefined();

      // 2. Verificar acceso con token válido
      await request(app)
        .get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // 3. Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(logoutRes.body.message).toMatch(/cerrada|logout/i);

      // 4. Intentar acceder de nuevo con el mismo token (debe fallar)
      const deniedRes = await request(app)
        .get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
        
      expect(deniedRes.body.message).toMatch(/revocado|invalido|expirado|revoked|invalid|expired/i);
    });
  });

  describe('Audit Logging (HIPAA)', () => {
    
    test('debe registrar login exitoso en audit_logs', async () => {
      const userData = {
        name: 'Audit User',
        email: 'audit@test.com',
        password: 'VerySecurePass123!@#',
        role: 'paciente'
      };

      await request(app).post('/api/v1/auth/register').send(userData);
      
      const user = await User.findOne({ email: userData.email });
      user.emailVerified = true;
      await user.save();

      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      // Verificar log
      // Agregar pequeño delay para async logging
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await AuditLog.find({ userId: user._id });
      // Puede haber log de 'AUTH_REGISTER' y 'AUTH_LOGIN'
      const loginLog = logs.find(l => l.action === 'LOGIN_SUCCESS' || l.action.includes('LOGIN'));
      
      expect(logs.length).toBeGreaterThan(0);
      // Verificar que al menos haya un log de tipo login
      expect(loginLog).toBeDefined();
    });
  });

});
