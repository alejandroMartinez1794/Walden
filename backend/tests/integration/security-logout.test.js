/**
 * 🔒 SECURITY TESTS - Token Blacklist & Secure Logout
 * 
 * Tests para verificar:
 * - Logout invalida tokens correctamente
 * - Tokens blacklisted no pueden usarse
 * - Tokens expirados se limpian automáticamente
 * - Audit logs se crean en logout
 */

process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import AuditLog from '../../models/AuditLogSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, generateTestToken } from './setup.js';
import { blacklistToken, isTokenBlacklisted, cleanupExpiredTokens } from '../../services/tokenBlacklist.js';
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

describe('🔒 Secure Logout - Token Blacklisting', () => {
  
  test('debe invalidar token en logout exitoso', async () => {
    // 1. Crear usuario
    const user = await createTestUser(User, {
      email: 'testuser@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    });
    
    const token = generateTestToken(user._id, 'paciente');
    
    // 2. Verificar que el token es válido ANTES de logout
    const beforeLogout = await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(beforeLogout.status).toBe(200);
    
    // 3. Hacer logout
    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(logoutResponse.body.success).toBe(true);
    expect(logoutResponse.body.message).toContain('invalidado');
    
    // 4. Verificar que el token está blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    expect(blacklisted).toBe(true);
    
    // 5. Intentar usar el token blacklisted (debe fallar)
    const afterLogout = await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    
    expect(afterLogout.body.success).toBe(false);
    expect(afterLogout.body.message).toContain('revoked');
  });

  test('debe crear audit log en logout', async () => {
    const user = await createTestUser(User, {
      email: 'audit@test.com',
      password: 'SecurePass123!',
      name: 'Audit User'
    });
    
    const token = generateTestToken(user._id, 'paciente');
    
    // Logout
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // Verificar que se creó audit log
    const auditLog = await AuditLog.findOne({
      userId: user._id,
      action: 'LOGOUT'
    });
    
    expect(auditLog).toBeDefined();
    expect(auditLog.result).toBe('SUCCESS');
    expect(auditLog.userEmail).toBe(user.email);
    expect(auditLog.containsPHI).toBe(false);
    expect(auditLog.severity).toBe('LOW');
  });

  test('debe rechazar logout sin autenticación', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .expect(401);
    
    expect(response.body.success).toBe(false);
  });

  test('debe rechazar requests con token ya blacklisted', async () => {
    const user = await createTestUser(User, {
      email: 'blacklisted@test.com',
      password: 'SecurePass123!',
      name: 'Blacklisted User'
    });
    
    const token = generateTestToken(user._id, 'paciente');
    
    // Blacklist manual del token
    const decoded = jwt.decode(token);
    await blacklistToken(
      token, 
      user._id, 
      new Date(decoded.exp * 1000), 
      'MANUAL_TEST'
    );
    
    // Intentar usar el token
    const response = await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    
    expect(response.body.message).toContain('revoked');
  });

  test('debe permitir múltiples tokens del mismo usuario (solo invalida el usado)', async () => {
    const user = await createTestUser(User, {
      email: 'multitoken@test.com',
      password: 'SecurePass123!',
      name: 'Multi Token User'
    });
    
    // Generar dos tokens DIFERENTES usando diferentes timestamps
    const token1 = jwt.sign(
      { id: user._id, role: 'paciente', session: 'session1' },
      process.env.JWT_SECRET_KEY || 'test-secret-key',
      { expiresIn: '15d' }
    );
    
    // Esperar 1ms para garantizar diferente timestamp en el JWT
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const token2 = jwt.sign(
      { id: user._id, role: 'paciente', session: 'session2' },
      process.env.JWT_SECRET_KEY || 'test-secret-key',
      { expiresIn: '15d' }
    );
    
    // Verificar que ambos tokens funcionan
    await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);
    
    await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);
    
    // Logout con token1
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);
    
    // token1 debe estar blacklisted
    const token1Blacklisted = await isTokenBlacklisted(token1);
    expect(token1Blacklisted).toBe(true);
    
    // token2 debe seguir funcionando
    const token2Blacklisted = await isTokenBlacklisted(token2);
    expect(token2Blacklisted).toBe(false);
    
    await request(app)
      .get('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);
  });
});

describe('🧹 Token Blacklist Cleanup', () => {
  
  test('debe limpiar tokens expirados', async () => {
    const user = await createTestUser(User, {
      email: 'cleanup@test.com',
      password: 'SecurePass123!',
      name: 'Cleanup User'
    });
    
    // Crear token expirado (1 segundo de expiración)
    const expiredToken = jwt.sign(
      { id: user._id, role: 'paciente' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1s' }
    );
    
    // Blacklist el token
    await blacklistToken(
      expiredToken,
      user._id,
      new Date(Date.now() + 1000), // Expira en 1 segundo
      'TEST_EXPIRED'
    );
    
    // Esperar a que expire
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Limpiar tokens expirados
    const cleaned = await cleanupExpiredTokens();
    
    // Verificar que el token expirado ya no está blacklisted
    const stillBlacklisted = await isTokenBlacklisted(expiredToken);
    expect(stillBlacklisted).toBe(false);
  });
});
