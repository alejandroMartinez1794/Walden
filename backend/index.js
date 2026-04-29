// ============= MONITORING & OBSERVABILITY =============
// CRITICAL: Datadog & New Relic MUST be loaded FIRST before any other modules
import './datadog.js';
import './newrelic.js';

import { createApp } from './app.js';
import { startServer as startServerOrchestrator } from './server.js';
import logger from './utils/logger.js';

export const app = createApp();
export default app;

export const startServer = async () => {
  return startServerOrchestrator(app);
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    logger.error('\n❌ Error critico al iniciar el servidor:', error.message);
    logger.error('   Stack trace:', error.stack);
    process.exit(1);
  });
}
