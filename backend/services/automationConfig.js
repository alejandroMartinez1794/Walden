// backend/services/automationConfig.js

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getAutomationConfig = () => {
  const enabled = process.env.AUTOMATION_ENABLED !== 'false';
  const timezone = process.env.AUTOMATION_TIMEZONE || 'America/Bogota';

  return {
    enabled,
    timezone,
    maxBatch: toNumber(process.env.AUTOMATION_MAX_BATCH, 50),
    emailThrottleMs: toNumber(process.env.AUTOMATION_EMAIL_THROTTLE_MS, 1000),
    alertRenotifyHours: toNumber(process.env.AUTOMATION_ALERT_RENOTIFY_HOURS, 2),
  };
};

export default { getAutomationConfig };