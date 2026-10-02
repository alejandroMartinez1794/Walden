import { generateClinicalSummary } from '../../utils/clinicalRules.js';

describe('generateClinicalSummary data integrity', () => {
  test('does not fabricate adherence when it is unavailable', () => {
    const summary = generateClinicalSummary();
    expect(summary.formulation).toContain('Adherencia a tareas: no disponible');
    expect(summary.formulation).not.toContain('70%');
  });

  test('uses an explicitly provided adherence value', () => {
    const summary = generateClinicalSummary({ adherence: 0.75 });
    expect(summary.formulation).toContain('75%');
  });

  test('keeps clinical summary usable without notes or measures', () => {
    const summary = generateClinicalSummary({ lastNotes: [] });
    expect(summary.flags).toEqual([]);
    expect(summary.formulation).toContain('Sin notas recientes disponibles.');
  });
});
