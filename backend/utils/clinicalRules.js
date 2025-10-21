// backend/utils/clinicalRules.js
// Regla clínica declarativa (no ML) para TCC: scoring, riesgo, formulación y sugerencias

export function scorePHQ9(responses = []) {
  // responses: array of numbers 0..3 length 9 OR array of objects with {itemNumber, response}
  const vals = responses.map((r) => (typeof r === 'number' ? r : Number(r?.response || 0)));
  const total = vals.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  const item9 = vals[8] ?? 0;
  let severity = 'minimal';
  if (total >= 20) severity = 'severe';
  else if (total >= 15) severity = 'moderately severe';
  else if (total >= 10) severity = 'moderate';
  else if (total >= 5) severity = 'mild';
  return { total, severity, item9 };
}

export function scoreGAD7(responses = []) {
  const vals = responses.map((r) => (typeof r === 'number' ? r : Number(r?.response || 0)));
  const total = vals.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  let severity = 'minimal';
  if (total >= 15) severity = 'severe';
  else if (total >= 10) severity = 'moderate';
  else if (total >= 5) severity = 'mild';
  return { total, severity };
}

// Detecta tendencias sobre últimas 4 medidas (slope simple) y diferencias absolutas
export function detectTrend(measures = []) {
  // measures: [{name:'PHQ-9', score:Number, date:Date}]
  const last4 = measures.slice(-4);
  if (last4.length < 2) return { slope: 0, delta: 0, worsening: false };
  const y = last4.map((m) => m.score);
  const n = y.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const delta = y[n - 1] - y[0];
  const worsening = delta >= 5; // aumento >=5 puntos en ~4 semanas
  return { slope, delta, worsening };
}

export function assessRisk({ phq9, measuresPHQ9 = [] }) {
  const flags = [];
  const reasons = [];
  if (phq9?.total >= 15) { flags.push('high_depression'); reasons.push('PHQ-9 >= 15'); }
  if ((phq9?.item9 || 0) >= 1) { flags.push('suicide_risk'); reasons.push('PHQ-9 ítem 9 positivo'); }
  const trend = detectTrend(measuresPHQ9);
  if (trend.worsening) { flags.push('worsening_trend'); reasons.push('Incremento ≥5 puntos en 4 semanas'); }
  return { flags, reasons, trend };
}

// Map de intervenciones mínimo requerido
function mapInterventions({ phq9, gad7 }) {
  const suggestions = [];
  if (phq9?.total >= 15) {
    suggestions.push({
      id: 'act_high_dep',
      name: 'Activación Conductual + Derivación Farmacológica',
      rationale: 'Síntomas depresivos moderados a severos requieren aumentar actividad gratificante y considerar co-tratamiento',
      script: 'Trabajemos en reactivar actividades valiosas esta semana. También, consideraré una interconsulta médica para apoyo farmacológico.',
      homework: ['Listar 5 actividades con valor personal', 'Programar 3 actividades esta semana', 'Registrar placer y logro (PA)'],
      expectedEffect: '4-8 semanas',
      evidenceRef: 'Cuijpers et al., meta-analysis BA',
      explanation: 'Regla: PHQ-9 ≥ 15',
    });
  } else if (phq9?.total >= 10) {
    suggestions.push({
      id: 'act_moderate_dep',
      name: 'Activación Conductual',
      rationale: 'Depresión moderada se beneficia de BA y contacto con refuerzo positivo',
      script: 'Vamos a calendarizar actividades pequeñas pero significativas, y monitorear su efecto en el ánimo.',
      homework: ['Programar 2-3 actividades', 'Registrar PA diario'],
      expectedEffect: '3-6 semanas',
      evidenceRef: 'BA RCTs',
      explanation: 'Regla: PHQ-9 10–14',
    });
  }

  if (gad7?.total >= 10) {
    suggestions.push({
      id: 'expo_gad',
      name: 'Exposición y Tolerancia a la Incertidumbre',
      rationale: 'Ansiedad clínica mejora con exposición in vivo y trabajo de incertidumbre',
      script: 'Construyamos una jerarquía de exposición y practicaremos permanecer con la incertidumbre sin rituales.',
      homework: ['Jerarquía 5 ítems', 'Exposición 2 veces a semana', 'Registro SUDS pre/post'],
      expectedEffect: '4-6 semanas',
      evidenceRef: 'Craske et al.',
      explanation: 'Regla: GAD-7 ≥ 10',
    });
  }
  return suggestions;
}

export function generateClinicalSummary({ measuresPHQ9 = [], measuresGAD7 = [], lastNotes = [], adherence = 0 }) {
  const phq9Latest = measuresPHQ9[measuresPHQ9.length - 1];
  const gad7Latest = measuresGAD7[measuresGAD7.length - 1];
  const risk = assessRisk({ phq9: phq9Latest, measuresPHQ9 });

  const formulation = [
    `El paciente presenta un patrón ${phq9Latest?.severity || 'desconocido'} de síntomas depresivos y ${gad7Latest?.severity || 'desconocido'} de ansiedad.`,
    risk.flags.includes('worsening_trend') ? 'Se observa empeoramiento reciente de síntomas, lo que sugiere necesidad de intensificar intervención.' : 'No se observan incrementos clínicamente significativos en las últimas semanas.',
    lastNotes[0] ? `Notas recientes indican: ${lastNotes[0]}` : 'Sin notas recientes disponibles.',
    `Adherencia a tareas estimada en ${Math.round(adherence * 100)}%.`,
  ].join(' ');

  const prioritizedTargets = [
    { id: 't_mood', label: 'Aumentar actividad gratificante', rationale: 'Asociado a reducción de anhedonia' },
    { id: 't_anxiety', label: 'Reducir evitación', rationale: 'Mantiene ansiedad a corto plazo' },
  ];

  const suggestedInterventions = mapInterventions({ phq9: phq9Latest, gad7: gad7Latest });

  return {
    formulation,
    prioritizedTargets,
    suggestedInterventions: suggestedInterventions.map((s) => ({ ...s, confidenceReason: 'Reglas basadas en guías TCC y medidas recientes' })),
    flags: risk.flags,
    reasons: risk.reasons,
    rulesApplied: suggestedInterventions.map((s) => s.explanation),
  };
}

export default {
  scorePHQ9,
  scoreGAD7,
  detectTrend,
  assessRisk,
  generateClinicalSummary,
};
