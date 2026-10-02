/**
 * Unit tests for the clinical request contracts.
 *
 * These tests intentionally validate the HTTP contract only. Clinical scoring
 * remains server-authoritative in the controller/rules layer.
 */

import { createMeasureSchema } from '../../validators/schemas/clinical.schemas.js';

const objectId = '507f1f77bcf86cd799439011';

describe('Clinical Schemas - createMeasureSchema', () => {
  test('accepts canonical PHQ-9 payload with numeric responses', () => {
    const payload = {
      name: 'PHQ-9',
      responses: Array.from({ length: 9 }, (_, index) => ({
        itemNumber: index + 1,
        response: index % 4,
      })),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('accepts legacy measureType alias for PHQ-9', () => {
    const payload = {
      measureType: 'phq9',
      responses: Array(9).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('accepts canonical GAD-7 payload', () => {
    const payload = {
      name: 'GAD-7',
      responses: Array(7).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('accepts supported BDI-II migration alias', () => {
    const payload = {
      measureType: 'bdi-ii',
      responses: Array(21).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('rejects unsupported migration aliases that Measure cannot persist', () => {
    const payload = {
      measureType: 'audit',
      responses: Array(10).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeDefined();
  });

  test('rejects PHQ-9 with an incomplete response set', () => {
    const payload = {
      name: 'PHQ-9',
      responses: Array(8).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeDefined();
  });

  test('rejects GAD-7 with an incomplete response set', () => {
    const payload = {
      name: 'GAD-7',
      responses: Array(6).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeDefined();
  });

  test('accepts assessmentId as provenance', () => {
    const payload = {
      name: 'PHQ-9',
      assessmentId: objectId,
      responses: Array(9).fill(0),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });

  test('does not require client-supplied totalScore or severity', () => {
    const payload = {
      name: 'PHQ-9',
      responses: Array(9).fill(1),
    };

    const { error } = createMeasureSchema.validate(payload);
    expect(error).toBeUndefined();
  });
});
