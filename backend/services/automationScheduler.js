// backend/services/automationScheduler.js
import cron from 'node-cron';
import { getAutomationConfig } from './automationConfig.js';
import logger from '../utils/logger.js';

export const scheduleTask = (expression, taskName, taskFn) => {
  const { enabled, timezone } = getAutomationConfig();

  if (!enabled) {
    return null;
  }

  let isRunning = false;

  return cron.schedule(
    expression,
    async () => {
      if (isRunning) {
        return;
      }

      isRunning = true;
      try {
        await taskFn();
      } catch (error) {
        logger.error(`❌ Error en tarea ${taskName}:`, error.message);
      } finally {
        isRunning = false;
      }
    },
    { timezone }
  );
};

export default { scheduleTask };