import cron from 'node-cron';

import { scheduleClinicalWorkersStart, stopClinicalWorkers } from './clinicalWorkers.js';
import { retryWithBackoff } from '../utils/retryWithClinicalBackoff.js';
import { ClinicalMetrics } from '../observability/clinicalMetrics.js';

export const CronJob = cron;

export async function startWorkers() {
  ClinicalMetrics.track('workers_starting', { source: 'backend/workers/index.js' });

  return retryWithBackoff(async () => {
    scheduleClinicalWorkersStart();
    ClinicalMetrics.track('workers_started', { status: 'ready' });
    return { started: true };
  });
}

export async function stopWorkers() {
  ClinicalMetrics.track('workers_stopping', { status: 'shutdown' });
  await stopClinicalWorkers();
  return { stopped: true };
}

export default {
  CronJob,
  startWorkers,
  stopWorkers,
};