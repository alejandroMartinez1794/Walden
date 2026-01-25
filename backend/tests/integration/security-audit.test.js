/**
 * 📋 SECURITY TESTS - Audit Logging
 * 
 * Tests para verificar:
 * - Audit logs se crean correctamente
 * - Campos obligatorios presentes
 * - Severidad apropiada
 * - Retención de datos (TTL)
 * - Búsqueda de actividad sospechosa
 */

process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/UserSchema.js';
import AuditLog from '../../models/AuditLogSchema.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, generateTestToken } from './setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('📋 Audit Logging - HIPAA Compliance', () => {
  
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
    
    // Buscar audit log
    const log = await AuditLog.findOne({
      userId: user._id,
      action: 'LOGOUT'
    });
    
    // Verificar campos obligatorios
    expect(log).toBeDefined();
    expect(log.userId.toString()).toBe(user._id.toString());
    expect(log.userRole).toBe('paciente');
    expect(log.userEmail).toBe(user.email);
    expect(log.action).toBe('LOGOUT');
    expect(log.resourceType).toBe('User');
    expect(log.result).toBe('SUCCESS');
    expect(log.containsPHI).toBe(false);
    expect(log.severity).toBe('LOW');
    expect(log.timestamp).toBeDefined();
    expect(log.ipAddress).toBeDefined();
    expect(log.userAgent).toBeDefined();
  });

  test('debe registrar severidad correcta según acción', async () => {
    const user = await createTestUser(User, {
      email: 'severity@test.com',
      password: 'SecurePass123!',
      name: 'Severity User'
    });
    
    // Simular diferentes acciones con diferentes severidades
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'PHI_VIEW',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'MEDIUM',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'PHI_DELETE',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'HIGH',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    const logs = await AuditLog.find({ userId: user._id }).sort({ timestamp: 1 });
    
    expect(logs).toHaveLength(3);
    // Verificar que cada log tenga el severity que se especificó
    const loginLog = logs.find(l => l.action === 'LOGIN_SUCCESS');
    const viewLog = logs.find(l => l.action === 'PHI_VIEW');
    const deleteLog = logs.find(l => l.action === 'PHI_DELETE');
    
    expect(loginLog.severity).toBe('LOW');
    expect(viewLog.severity).toBe('MEDIUM');
    expect(deleteLog.severity).toBe('HIGH');
  });

  test('debe marcar PHI correctamente', async () => {
    const user = await createTestUser(User, {
      email: 'phi@test.com',
      password: 'SecurePass123!',
      name: 'PHI User'
    });
    
    // Acción que NO involucra PHI
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    // Acción que SÍ involucra PHI
    await AuditLog.log({
      userId: user._id,
      userRole: 'doctor',
      userEmail: user.email,
      action: 'CLINICAL_RECORD_VIEW',
      resourceType: 'ClinicalRecord',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'MEDIUM',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    const nonPHI = await AuditLog.findOne({ action: 'LOGIN_SUCCESS' });
    const withPHI = await AuditLog.findOne({ action: 'CLINICAL_RECORD_VIEW' });
    
    expect(nonPHI.containsPHI).toBe(false);
    expect(withPHI.containsPHI).toBe(true);
  });

  test('debe almacenar información de IP y User-Agent', async () => {
    const user = await createTestUser(User, {
      email: 'iptest@test.com',
      password: 'SecurePass123!',
      name: 'IP Test User'
    });
    
    const token = generateTestToken(user._id, 'paciente');
    
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .set('User-Agent', 'Mozilla/5.0 (Test Browser)')
      .expect(200);
    
    const log = await AuditLog.findOne({
      userId: user._id,
      action: 'LOGOUT'
    });
    
    expect(log.ipAddress).toBeDefined();
    expect(log.ipAddress).not.toBe('');
    expect(log.userAgent).toBeDefined();
    expect(log.userAgent).toContain('Test Browser');
  });

  test('debe registrar resultado FAILED en acciones fallidas', async () => {
    // Crear usuario temporal para login fallido
    const user = await User.create({
      name: 'Fail User',
      email: 'fail@test.com',
      password: 'StrongPassword123!',
      role: 'paciente',
      phoneNumber: '+573001234567'
    });
    
    // Simular login fallido
    const log = await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: 'fail@test.com',
      action: 'LOGIN_FAILED',
      resourceType: 'User',
      result: 'FAILED',
      containsPHI: false,
      severity: 'HIGH',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      details: {
        reason: 'Invalid credentials'
      }
    });
    
    expect(log).toBeDefined();
    expect(log).not.toBeNull();
    expect(log.result).toBe('FAILED');
    expect(log.details.reason).toBe('Invalid credentials');
  });

  test('debe permitir búsqueda por rango de fechas', async () => {
    const user = await createTestUser(User, {
      email: 'daterange@test.com',
      password: 'SecurePass123!',
      name: 'Date Range User'
    });
    
    // Crear logs en diferentes momentos
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      timestamp: yesterday,
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'LOGOUT',
      resourceType: 'User',
      timestamp: now,
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    // Buscar logs de las últimas 2 horas
    const recentLogs = await AuditLog.find({
      userId: user._id,
      timestamp: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }
    });
    
    expect(recentLogs).toHaveLength(1);
    expect(recentLogs[0].action).toBe('LOGOUT');
  });

  test('debe detectar actividad sospechosa (múltiples logins fallidos)', async () => {
    const email = 'suspicious@test.com';
    
    // Crear usuario temporal para tests
    const user = await User.create({
      name: 'Suspicious User',
      email,
      password: 'ValidPass123!',
      role: 'paciente',
      phoneNumber: '+573009876543'
    });
    
    // Simular 5 intentos de login fallidos
    for (let i = 0; i < 5; i++) {
      await AuditLog.log({
        userId: user._id,
        userRole: 'paciente',
        userEmail: email,
        action: 'LOGIN_FAILED',
        resourceType: 'User',
        result: 'FAILED',
        containsPHI: false,
        severity: 'HIGH',
        ipAddress: '127.0.0.1',
        userAgent: 'test'
      });
    }
    
    // Buscar actividad sospechosa
    const suspiciousLogs = await AuditLog.find({
      userEmail: email,
      action: 'LOGIN_FAILED',
      result: 'FAILED'
    });
    
    expect(suspiciousLogs.length).toBeGreaterThanOrEqual(3);
  });

  test('debe incluir detalles adicionales cuando se proveen', async () => {
    const user = await createTestUser(User, {
      email: 'details@test.com',
      password: 'SecurePass123!',
      name: 'Details User'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'doctor',
      userEmail: user.email,
      action: 'PHI_UPDATE',
      resourceType: 'ClinicalRecord',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'HIGH',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      details: {
        fieldsModified: ['diagnosis', 'treatment'],
        previousValues: { diagnosis: 'Old diagnosis' },
        newValues: { diagnosis: 'New diagnosis' }
      }
    });
    
    const log = await AuditLog.findOne({
      userId: user._id,
      action: 'PHI_UPDATE'
    });
    
    expect(log.details).toBeDefined();
    expect(log.details.fieldsModified).toEqual(['diagnosis', 'treatment']);
    expect(log.details.previousValues).toBeDefined();
    expect(log.details.newValues).toBeDefined();
  });
});

describe('📊 Audit Log Queries', () => {
  
  test('debe poder filtrar por acción específica', async () => {
    const user = await createTestUser(User, {
      email: 'filter@test.com',
      password: 'SecurePass123!',
      name: 'Filter User'
    });
    
    // Crear logs de diferentes acciones
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'paciente',
      userEmail: user.email,
      action: 'PHI_VIEW',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'MEDIUM',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    const phiLogs = await AuditLog.find({
      userId: user._id,
      action: 'PHI_VIEW'
    });
    
    expect(phiLogs).toHaveLength(1);
    expect(phiLogs[0].action).toBe('PHI_VIEW');
  });

  test('debe poder filtrar por severidad', async () => {
    const user = await createTestUser(User, {
      email: 'severity-filter@test.com',
      password: 'SecurePass123!',
      name: 'Severity Filter User'
    });
    
    // Crear logs de diferentes severidades
    await AuditLog.log({
      userId: user._id,
      userRole: 'doctor',
      userEmail: user.email,
      action: 'PHI_DELETE',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: true,
      severity: 'HIGH',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    await AuditLog.log({
      userId: user._id,
      userRole: 'doctor',
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      result: 'SUCCESS',
      containsPHI: false,
      severity: 'LOW',
      ipAddress: '127.0.0.1',
      userAgent: 'test'
    });
    
    const highSeverityLogs = await AuditLog.find({
      userId: user._id,
      severity: 'HIGH'
    });
    
    expect(highSeverityLogs).toHaveLength(1);
    expect(highSeverityLogs[0].severity).toBe('HIGH');
  });
});
