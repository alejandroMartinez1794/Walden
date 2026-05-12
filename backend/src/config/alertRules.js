import alertRules, { evaluateDegradation } from '../../config/alertRules.js';

export const p95_latency = alertRules.p95_latency;
export const alert_delivery = alertRules.alert_delivery;
export { evaluateDegradation };
export default alertRules;
