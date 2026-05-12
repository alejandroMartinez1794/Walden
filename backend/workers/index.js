import cron from 'node-cron';

import { scheduleClinicalWorkersStart, stopClinicalWorkers } from './clinicalWorkers.js';
import { ClinicalMetrics } from '../observability/clinicalMetrics.js';

export const CronJob = cron;

export function startWorkers() {
  ClinicalMetrics.track('workers_starting', { source: 'backend/workers/index.js' });

  scheduleClinicalWorkersStart(5000, {
    onScheduled: (metadata) => {
      ClinicalMetrics.track('workers_scheduled', {
        status: 'pending',
        ...metadata,
      });
    },
    onStarted: (metadata) => {
      ClinicalMetrics.track('workers_started', {
        status: 'ready',
        ...metadata,
      });
    },
  });

  return { scheduled: true };
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