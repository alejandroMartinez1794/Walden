export const alertRules = {
  p95_latency: {
    thresholdMs: 1000,
    severity: 'high',
  },
  alert_delivery: {
    thresholdCount: 1,
    severity: 'critical',
  },
};

export const evaluateDegradation = (snapshot = {}) => {
  const p95_latency = snapshot?.operational?.p95Latency ?? 0;
  const alert_delivery = snapshot?.business?.alertsDelivered ?? 0;

  return {
    p95_latency,
    alert_delivery,
    circuit_open: p95_latency > alertRules.p95_latency.thresholdMs || alert_delivery < alertRules.alert_delivery.thresholdCount,
  };
};

export default alertRules;