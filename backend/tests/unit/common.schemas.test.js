/**
 * 🧪 TESTS UNITARIOS - Common Schemas
 * 
 * Tests para esquemas reutilizables de validación
 * 
 * Esquemas testeados:
 * - mongoIdSchema
 * - emailSchema
 * - passwordSchema
 * - phoneSchema
 * - dateISOSchema
 * - paginationSchema
 * - roleSchema
 */

import {
  mongoIdSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  dateISOSchema,
  paginationSchema,
  roleSchema,
  urlSchema,
  textLongSchema,
  textShortSchema
} from '../../validators/schemas/common.schemas.js';

describe('Common Schemas - mongoIdSchema', () => {
  test('debe aceptar MongoDB ObjectId válido', () => {
    const validIds = [
      '507f1f77bcf86cd799439011',
      '507f191e810c19729de860ea',
      'abcdef1234567890abcdef12'
    ];

    validIds.forEach(id => {
      const { error } = mongoIdSchema.validate(id);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar IDs inválidos', () => {
    const invalidIds = [
      'invalid-id',
      '123',
      '507f1f77bcf86cd799439xyz', // contiene 'xyz'
      '507f1f77bcf86cd79943901',  // muy corto (23 chars)
      '507f1f77bcf86cd799439011a', // muy largo (25 chars)
      ''
    ];

    invalidIds.forEach(id => {
      const { error } = mongoIdSchema.validate(id);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - emailSchema', () => {
  test('debe aceptar emails válidos', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
      'user_123@test-domain.com'
    ];

    validEmails.forEach(email => {
      const { error } = emailSchema.validate(email);
      expect(error).toBeUndefined();
    });
  });

  test('debe normalizar emails a minúsculas', () => {
    const { value } = emailSchema.validate('USER@EXAMPLE.COM');
    expect(value).toBe('user@example.com');
  });

  test('debe eliminar espacios al inicio/final', () => {
    const { value } = emailSchema.validate('  user@example.com  ');
    expect(value).toBe('user@example.com');
  });

  test('debe rechazar emails inválidos', () => {
    const invalidEmails = [
      'not-an-email',
      'user@',
      '@example.com',
      'user @example.com', // espacio
      'user..double@example.com',
      '',
      'a'.repeat(255) + '@example.com' // muy largo (> 254)
    ];

    invalidEmails.forEach(email => {
      const { error } = emailSchema.validate(email);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - passwordSchema', () => {
  test('debe aceptar contraseñas válidas', () => {
    const validPasswords = [
      'MyP@ssw0rd',
      'Test123!@#',
      'Abc123!def',
      'P@ssw0rd2024'
    ];

    validPasswords.forEach(password => {
      const { error } = passwordSchema.validate(password);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar contraseñas sin mayúscula', () => {
    const { error } = passwordSchema.validate('myp@ssw0rd');
    expect(error).toBeDefined();
    expect(error.message).toContain('mayúscula');
  });

  test('debe rechazar contraseñas sin minúscula', () => {
    const { error } = passwordSchema.validate('MYP@SSW0RD');
    expect(error).toBeDefined();
  });

  test('debe rechazar contraseñas sin número', () => {
    const { error } = passwordSchema.validate('MyP@ssword');
    expect(error).toBeDefined();
    expect(error.message).toContain('número');
  });

  test('debe rechazar contraseñas sin símbolo especial', () => {
    const { error } = passwordSchema.validate('MyPassw0rd');
    expect(error).toBeDefined();
    expect(error.message).toContain('símbolo');
  });

  test('debe rechazar contraseñas muy cortas (< 8)', () => {
    const { error } = passwordSchema.validate('Abc1!');
    expect(error).toBeDefined();
    expect(error.message).toContain('8');
  });

  test('debe rechazar contraseñas muy largas (> 128)', () => {
    // Crear contraseña de 130 caracteres (> 128)
    const longPassword = 'A1!a' + 'x'.repeat(126); // 4 + 126 = 130 caracteres
    const { error } = passwordSchema.validate(longPassword);
    expect(error).toBeDefined();
    if (error) {
      expect(error.message).toContain('128');
    }
  });
});

describe('Common Schemas - phoneSchema', () => {
  test('debe aceptar formatos de teléfono válidos', () => {
    const validPhones = [
      '+34 600 123 456',
      '+1-555-123-4567',
      '(555) 123-4567',
      '+52 1 55 1234 5678',
      '3001234567'
    ];

    validPhones.forEach(phone => {
      const { error } = phoneSchema.validate(phone);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar teléfonos inválidos', () => {
    const invalidPhones = [
      'abc',
      '123',
      '+',
      ''
    ];

    invalidPhones.forEach(phone => {
      const { error } = phoneSchema.validate(phone);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - dateISOSchema', () => {
  test('debe aceptar fechas ISO 8601 válidas', () => {
    const validDates = [
      '2024-01-15T10:00:00.000Z',
      '2024-12-31T23:59:59Z',
      '2024-06-15T14:30:00+02:00'
    ];

    validDates.forEach(date => {
      const { error } = dateISOSchema.validate(date);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar formatos de fecha inválidos', () => {
    const invalidDates = [
      '2024-13-01', // mes inválido
      '2024-01-32', // día inválido
      '01/15/2024', // formato incorrecto
      'invalid-date',
      ''
    ];

    invalidDates.forEach(date => {
      const { error } = dateISOSchema.validate(date);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - paginationSchema', () => {
  test('debe usar valores por defecto', () => {
    const { value } = paginationSchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });

  test('debe aceptar valores válidos', () => {
    const { error, value } = paginationSchema.validate({ page: 2, limit: 50 });
    expect(error).toBeUndefined();
    expect(value.page).toBe(2);
    expect(value.limit).toBe(50);
  });

  test('debe rechazar page < 1', () => {
    const { error } = paginationSchema.validate({ page: 0 });
    expect(error).toBeDefined();
  });

  test('debe rechazar limit > 100', () => {
    const { error } = paginationSchema.validate({ limit: 150 });
    expect(error).toBeDefined();
    expect(error.message).toContain('100');
  });

  test('debe convertir strings a números', () => {
    const { value } = paginationSchema.validate({ page: '3', limit: '25' });
    expect(value.page).toBe(3);
    expect(value.limit).toBe(25);
    expect(typeof value.page).toBe('number');
  });
});

describe('Common Schemas - roleSchema', () => {
  test('debe aceptar roles válidos', () => {
    const validRoles = ['paciente', 'doctor', 'admin'];

    validRoles.forEach(role => {
      const { error } = roleSchema.validate(role);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar roles inválidos', () => {
    const invalidRoles = ['user', 'superadmin', 'guest', ''];

    invalidRoles.forEach(role => {
      const { error } = roleSchema.validate(role);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - urlSchema', () => {
  test('debe aceptar URLs válidas', () => {
    const validUrls = [
      'https://example.com',
      'http://subdomain.example.com/path',
      'https://example.com:8080/path?query=value'
    ];

    validUrls.forEach(url => {
      const { error } = urlSchema.validate(url);
      expect(error).toBeUndefined();
    });
  });

  test('debe rechazar URLs sin protocolo http/https', () => {
    const invalidUrls = [
      'ftp://example.com',
      'example.com',
      'javascript:alert(1)'
    ];

    invalidUrls.forEach(url => {
      const { error } = urlSchema.validate(url);
      expect(error).toBeDefined();
    });
  });
});

describe('Common Schemas - textSchemas', () => {
  test('textShortSchema debe aceptar texto corto válido', () => {
    const { error } = textShortSchema.validate('Texto corto');
    expect(error).toBeUndefined();
  });

  test('textShortSchema debe rechazar texto muy largo', () => {
    const longText = 'a'.repeat(101);
    const { error } = textShortSchema.validate(longText);
    expect(error).toBeDefined();
  });

  test('textLongSchema debe aceptar texto largo válido', () => {
    const longText = 'a'.repeat(500);
    const { error } = textLongSchema.validate(longText);
    expect(error).toBeUndefined();
  });

  test('textLongSchema debe rechazar texto muy corto', () => {
    const { error } = textLongSchema.validate('abc');
    expect(error).toBeDefined();
  });

  test('textLongSchema debe rechazar texto extremadamente largo', () => {
    const veryLongText = 'a'.repeat(2001);
    const { error } = textLongSchema.validate(veryLongText);
    expect(error).toBeDefined();
  });
});
