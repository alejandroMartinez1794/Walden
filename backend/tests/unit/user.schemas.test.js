/**
 * 🧪 TESTS UNITARIOS - User Schemas
 * 
 * Tests para esquemas de gestión de usuarios/pacientes
 * 
 * Esquemas testeados:
 * - updateUserSchema (perfil de paciente)
 * - updateUserPasswordSchema (cambio de contraseña)
 * - getUsersQuerySchema (búsqueda y filtros)
 */

import {
  updateUserSchema,
  getUsersQuerySchema
} from '../../validators/schemas/user.schemas.js';

// NOTA: updateUserPasswordSchema no existe en el código actual
// Se usa changePasswordSchema en auth.schemas.js

describe('User Schemas - updateUserSchema', () => {
  const validUserUpdate = {
    name: 'Juan Pérez García',
    phone: '+34 612 345 678',
    gender: 'male',
    bloodType: 'A+'
  };

  test('debe aceptar actualización completa de perfil', () => {
    const { error } = updateUserSchema.validate(validUserUpdate);
    expect(error).toBeUndefined();
  });

  test('debe aceptar actualización parcial', () => {
    const { error } = updateUserSchema.validate({
      name: 'Pedro López',
      phone: '+34 600 111 222'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar nombre muy corto', () => {
    // TODO: textShortSchema permite 1+ caracteres, no 3+
    const { error } = updateUserSchema.validate({
      name: 'AB'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('3');
  });

  test('debe rechazar nombre muy largo', () => {
    const longName = 'a'.repeat(101);
    const { error } = updateUserSchema.validate({
      name: longName
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar teléfono inválido', () => {
    const { error } = updateUserSchema.validate({
      phone: '123'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar género inválido', () => {
    const { error } = updateUserSchema.validate({
      gender: 'unknown'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar tipo de sangre inválido', () => {
    const { error } = updateUserSchema.validate({
      bloodType: 'Z+'
    });
    expect(error).toBeDefined();
  });

  // NOTA: emergencyContact no está implementado en updateUserSchema actual

  test('debe aceptar foto con URL válida', () => {
    const { error } = updateUserSchema.validate({
      photo: 'https://example.com/user-photo.jpg'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar foto con URL inválida', () => {
    const { error } = updateUserSchema.validate({
      photo: 'not-a-url'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar email inválido', () => {
    const { error } = updateUserSchema.validate({
      email: 'invalid-email'
    });
    expect(error).toBeDefined();
  });

  test('debe normalizar email a minúsculas', () => {
    const { value } = updateUserSchema.validate({
      email: 'USER@EXAMPLE.COM'
    });
    expect(value.email).toBe('user@example.com');
  });

  test('debe prohibir cambio de role', () => {
    const { error } = updateUserSchema.validate({
      role: 'admin'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('no puede ser modificado');
  });
});

// TODO: updateUserPasswordSchema no existe - usar changePasswordSchema de auth.schemas.js
// Descomentar y mover a auth.schemas.test.js cuando se implemente
/*
describe('User Schemas - updateUserPasswordSchema', () => {
  test('debe aceptar cambio de contraseña válido', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
      confirmPassword: 'NewPass456!'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar si newPassword no coincide con confirmPassword', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
      confirmPassword: 'DifferentPass789!'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('coinciden');
  });

  test('debe rechazar si newPassword es igual a currentPassword', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'SamePass123!',
      newPassword: 'SamePass123!',
      confirmPassword: 'SamePass123!'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('diferente');
  });

  test('debe rechazar contraseña débil', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'OldPass123!',
      newPassword: 'weak',
      confirmPassword: 'weak'
    });
    expect(error).toBeDefined();
  });

  test('debe requerir currentPassword', () => {
    const { error } = updateUserPasswordSchema.validate({
      newPassword: 'NewPass456!',
      confirmPassword: 'NewPass456!'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('currentPassword');
  });

  test('debe requerir newPassword', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'OldPass123!',
      confirmPassword: 'NewPass456!'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('newPassword');
  });

  test('debe requerir confirmPassword', () => {
    const { error } = updateUserPasswordSchema.validate({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!'
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('confirmPassword');
  });
});
*/

describe('User Schemas - getUsersQuerySchema', () => {
  test('debe usar valores por defecto para paginación', () => {
    const { value } = getUsersQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(10);
  });

  test('debe aceptar búsqueda por nombre', () => {
    const { error } = getUsersQuerySchema.validate({
      search: 'Juan'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar búsqueda por email', () => {
    const { error } = getUsersQuerySchema.validate({
      email: 'user@example.com'
    });
    expect(error).toBeUndefined();
  });

  test('debe aceptar filtro por género', () => {
    const { error } = getUsersQuerySchema.validate({
      gender: 'male'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar género inválido', () => {
    const { error } = getUsersQuerySchema.validate({
      gender: 'unknown'
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar filtro por tipo de sangre', () => {
    // TODO: Campo bloodType no existe en getUsersQuerySchema
    const { error } = getUsersQuerySchema.validate({
      bloodType: 'O+'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar tipo de sangre inválido', () => {
    // TODO: Campo bloodType no existe en getUsersQuerySchema
    const { error } = getUsersQuerySchema.validate({
      bloodType: 'Z+'
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar filtro por role', () => {
    const { error } = getUsersQuerySchema.validate({
      role: 'paciente'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar role inválido', () => {
    const { error } = getUsersQuerySchema.validate({
      role: 'invalid-role'
    });
    expect(error).toBeDefined();
  });

  test('debe aceptar ordenamiento válido', () => {
    // TODO: Verificar si getUsersQuerySchema tiene campos sortBy/sortOrder
    const { error } = getUsersQuerySchema.validate({
      sortBy: 'name',
      sortOrder: 'asc'
    });
    expect(error).toBeUndefined();
  });

  test('debe rechazar sortBy inválido', () => {
    const { error } = getUsersQuerySchema.validate({
      sortBy: 'invalid-field'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar sortOrder inválido', () => {
    const { error } = getUsersQuerySchema.validate({
      sortOrder: 'random'
    });
    expect(error).toBeDefined();
  });

  test('debe rechazar limit > 100 (protección DoS)', () => {
    const { error } = getUsersQuerySchema.validate({
      limit: 200
    });
    expect(error).toBeDefined();
  });

  test('debe convertir string a number en paginación', () => {
    const { value } = getUsersQuerySchema.validate({
      page: '5',
      limit: '50'
    });
    expect(value.page).toBe(5);
    expect(value.limit).toBe(50);
  });
});
