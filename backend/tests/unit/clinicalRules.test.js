import { generateClinicalSummary } from '../../utils/clinicalRules.js';

describe('Clinical rules - data provenance', () => {
  test('no presenta adherencia inventada cuando no hay datos disponibles', () => {
    const summary = generateClinicalSummary({
      measuresPHQ9: [],
      measuresGAD7: [],
      lastNotes: [],
      adherence: null,
    });

    expect(summary.formulation).toContain(
      'Adherencia a tareas no disponible'
    );
    expect(summary.formulation).not.toContain('70%');
  });

  test('calcula adherencia únicamente cuando existe un valor verificable', () => {
    const summary = generateClinicalSummary({
      measuresPHQ9: [],
      measuresGAD7: [],
      lastNotes: [],
      adherence: 0.8,
    });

    expect(summary.formulation).toContain(
      'Adherencia a tareas calculada en 80%.'
    );
  });
});
