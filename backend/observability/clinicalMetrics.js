import { clinicalMetricsService } from '../services/ClinicalMetricsService.js';

export const ClinicalMetrics = {
  track(eventName, payload = {}) {
    const snapshot = clinicalMetricsService.getMetricsSnapshot();
    const event = clinicalMetricsService.recordEvent(eventName, payload);

    return {
      ...event,
      p95_latency: snapshot.operational?.p95Latency ?? 0,
      alert_delivery: snapshot.business?.alertsDelivered ?? 0,
    };
  },
};

export const evaluateDegradation = (snapshot = clinicalMetricsService.getMetricsSnapshot()) => {
  const p95_latency = snapshot.operational?.p95Latency ?? 0;
  const alert_delivery = snapshot.business?.alertsDelivered ?? 0;

  return {
    p95_latency,
    alert_delivery,
    circuit_open: p95_latency > 1000 || alert_delivery === 0,
  };
};

export default ClinicalMetrics;