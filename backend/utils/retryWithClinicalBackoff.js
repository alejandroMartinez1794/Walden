import { ClinicalMetrics } from '../observability/clinicalMetrics.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const circuit_open = 'circuit_open';

export async function retryWithBackoff(task, options = {}) {
  const {
    retries = 3,
    baseDelayMs = 250,
    maxDelayMs = 2000,
    label = 'clinical-task',
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const event = ClinicalMetrics.track('retryWithBackoff', {
        label,
        attempt,
        circuitState: attempt === retries ? circuit_open : 'closed',
        error: error.message,
      });

      if (process.env.NODE_ENV !== 'test') {
        console.info('Clinical retry event', event);
      }

      if (attempt === retries) {
        break;
      }

      const delay = Math.min(baseDelayMs * (2 ** attempt), maxDelayMs);
      await sleep(delay);
    }
  }

  throw lastError;
}

export default retryWithBackoff;