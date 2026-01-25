/**
 * 🧪 TESTS UNITARIOS - Auth Schemas
 * 
 * Tests para esquemas de autenticación
 * 
 * Esquemas testeados:
 * - registerSchema
 * - loginSchema
 * - passwordResetRequestSchema
 * - passwordResetConfirmSchema
 * - changePasswordSchema
 */

import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  changePasswordSchema,
  emailVerificationSchema,
  twoFactorSetupSchema,
  twoFactorLoginSchema
} from '../../validators/schemas/auth.schemas.js';

describe('Auth Schemas - registerSchema', () => {
  const validPatientData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'MyP@ssw0rd123',
    role: 'paciente',
    gender: 'male'
  };

  const validDoctorData = {
    name: 'María García López',
    email: 'maria@example.com',
    password: 'MyP@ssw0rd123',
    role: 'doctor',
    specialization: 'Cardiólogo',
    gender: 'female'
  };

  test('debe aceptar registro de paciente válido', () => {
    const { error } = registerSchema.validate(validPatientData);
    expect(error).toBeUndefined();
  });

  test('debe aceptar registro de doctor válido', () => {
    const { error } = registerSchema.validate(validDoctorData);
    expect(error).toBeUndefined();
  });

  test('debe usar role "paciente" por defecto', () => {
    const data = { ...validPatientData };
    delete data.role;
    const { value } = registerSchema.validate(data);
    expect(value.role).toBe('paciente');
  });

  test('debe rechazar role "admin"', () => {
    const data = { ...validPatientData, role: 'admin' };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('paciente');
  });

  // NOTA: specialization es opcional en registro (se completa en perfil después)
  test('debe requerir specialization para doctores', () => {
    const data = { ...validDoctorData };
    delete data.specialization;
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('especialización');
  });

  test('debe prohibir specialization para pacientes', () => {
    const data = { ...validPatientData, specialization: 'Cardiólogo' };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar campos obligatorios faltantes', () => {
    const requiredFields = ['name', 'email', 'password'];
    
    requiredFields.forEach(field => {
      const data = { ...validPatientData };
      delete data[field];
      const { error } = registerSchema.validate(data);
      expect(error).toBeDefined();
      // Joi usa mensajes genéricos, no menciona el campo específico
    });
  });

  test('debe rechazar email inválido', () => {
    const data = { ...validPatientData, email: 'not-an-email' };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar contraseña débil', () => {
    const data = { ...validPatientData, password: '12345678' };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe eliminar campos no permitidos (stripUnknown)', () => {
    // TODO: El schema no usa stripUnknown, solo valida campos definidos
    const data = { 
      ...validPatientData, 
      isApproved: true,  // No permitido
      deletedAt: new Date() // No permitido
    };
    const { value } = registerSchema.validate(data);
    expect(value.isApproved).toBeUndefined();
    expect(value.deletedAt).toBeUndefined();
  });
});

describe('Auth Schemas - loginSchema', () => {
  test('debe aceptar credenciales válidas', () => {
    const data = {
      email: 'user@example.com',
      password: 'anypassword' // No valida complejidad en login
    };
    const { error } = loginSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test('debe rechazar email inválido', () => {
    const data = {
      email: 'not-an-email',
      password: 'password123'
    };
    const { error } = loginSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe rechazar password vacío', () => {
    const data = {
      email: 'user@example.com',
      password: ''
    };
    const { error } = loginSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('debe requerir hCaptcha en producción', () => {
    const data = {
      email: 'user@example.com',
      password: 'password123'
    };
    
    // Simular producción
    const context = { env: 'production' };
    const { error } = loginSchema.validate(data, { context });
    
    // Debe fallar sin hCaptchaToken
    expect(error).toBeDefined();
  });

  test('NO debe requerir hCaptcha en desarrollo', () => {
    const data = {
      email: 'user@example.com',
      password: 'password123'
    };
    
    const context = { env: 'development' };
    const { error } = loginSchema.validate(data, { context });
    
    expect(error).toBeUndefined();
  });
});

describe('Auth Schemas - passwordResetRequestSchema', () => {
  test('debe aceptar email válido', () => {
    const { error } = passwordResetRequestSchema.validate({
      email: 'user@example.com'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar email inválido', () => {
    const { error } = passwordResetRequestSchema.validate({
      email: 'not-an-email'
    });
    expect(error).toBeDefined();
  });

  test('debe normalizar email a minúsculas', () => {
    const { value } = passwordResetRequestSchema.validate({
      email: 'USER@EXAMPLE.COM'
    });
    expect(value.email).toBe('user@example.com');
  });
});

describe('Auth Schemas - passwordResetConfirmSchema', () => {
  const validData = {
    token: 'a'.repeat(64), // 64 caracteres hex
    newPassword: 'NewP@ssw0rd123',
    confirmPassword: 'NewP@ssw0rd123'
  };

  test('debe aceptar reset válido', () => {
    const { error } = passwordResetConfirmSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('debe rechazar token muy corto', () => {
    // TODO: El schema no valida longitud específica del token
    const data = { ...validData, token: 'abc123' };
    const { error } = passwordResetConfirmSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('64');
  });

  test('debe rechazar contraseñas que no coinciden', () => {
    const data = { 
      ...validData, 
      confirmPassword: 'DifferentP@ssw0rd' 
    };
    const { error } = passwordResetConfirmSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('coincidir');
  });

  test('debe rechazar contraseña débil', () => {
    const data = { 
      ...validData, 
      newPassword: 'weak',
      confirmPassword: 'weak'
    };
    const { error } = passwordResetConfirmSchema.validate(data);
    expect(error).toBeDefined();
  });
});

describe('Auth Schemas - changePasswordSchema', () => {
  const validData = {
    currentPassword: 'OldP@ssw0rd123',
    newPassword: 'NewP@ssw0rd123',
    confirmPassword: 'NewP@ssw0rd123'
  };

  test('debe aceptar cambio válido', () => {
    const { error } = changePasswordSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('debe rechazar si newPassword === currentPassword', () => {
    const data = {
      currentPassword: 'SameP@ssw0rd123',
      newPassword: 'SameP@ssw0rd123',
      confirmPassword: 'SameP@ssw0rd123'
    };
    const { error } = changePasswordSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.message).toContain('diferente');
  });

  test('debe rechazar si newPassword !== confirmPassword', () => {
    const data = {
      currentPassword: 'OldP@ssw0rd123',
      newPassword: 'NewP@ssw0rd123',
      confirmPassword: 'DifferentP@ssw0rd'
    };
    const { error } = changePasswordSchema.validate(data);
    expect(error).toBeDefined();
  });
});

describe('Auth Schemas - emailVerificationSchema', () => {
  test('debe aceptar token válido de 64 caracteres hex', () => {
    const validToken = 'a'.repeat(64);
    const { error } = emailVerificationSchema.validate({ token: validToken });
    expect(error).toBeUndefined();
  });

  test('debe rechazar token muy corto', () => {
    const { error } = emailVerificationSchema.validate({ token: 'abc123' });
    expect(error).toBeDefined();
  });

  test('debe rechazar token no hex', () => {
    const invalidToken = 'z'.repeat(64); // 'z' no es hex
    const { error } = emailVerificationSchema.validate({ token: invalidToken });
    expect(error).toBeDefined();
  });
});

describe('Auth Schemas - twoFactorSchemas', () => {
  test('twoFactorSetupSchema debe aceptar código de 6 dígitos', () => {
    const { error } = twoFactorSetupSchema.validate({ token: '123456' });
    expect(error).toBeUndefined();
  });

  test('twoFactorSetupSchema debe rechazar código no numérico', () => {
    const { error } = twoFactorSetupSchema.validate({ token: 'abc123' });
    expect(error).toBeDefined();
  });

  test('twoFactorSetupSchema debe rechazar código de longitud incorrecta', () => {
    const { error } = twoFactorSetupSchema.validate({ token: '12345' });
    expect(error).toBeDefined();
    expect(error.message).toContain('6');
  });

  test('twoFactorLoginSchema debe requerir código y token', () => {
    const validData = {
      token: '123456',
      tempToken: 'temporary-token-string'
    };
    const { error } = twoFactorLoginSchema.validate(validData);
    expect(error).toBeUndefined();
  });
});
