import { scorePHQ9, screenForRiskSignals, generateClinicalSummary } from '../../utils/clinicalRules.js';

describe('Clinical rules - risk screening', () => {
  test('normalizes PHQ-9 moderately-severe severity', () => {
    const result = scorePHQ9(Array(9).fill(2));
    expect(result.total).toBe(18);
    expect(result.severity).toBe('moderately-severe');
  });

  test('screening detects item 9 without creating a formal risk assessment', () => {
    const result = screenForRiskSignals({
      phq9: { total: 8, item9: 1 },
      measuresPHQ9: [],
    });

    expect(result.flags).toContain('suicide_risk');
    expect(result.reasons).toContain('PHQ-9 ítem 9 positivo');
  });

  test('clinical summary does not fabricate adherence when data is absent', () => {
    const result = generateClinicalSummary({
      measuresPHQ9: [{ score: 4, date: new Date() }],
      measuresGAD7: [{ score: 3, date: new Date() }],
    });

    expect(result.formulation).toContain('Adherencia a tareas no disponible');
    expect(result.formulation).not.toContain('70%');
  });
});
