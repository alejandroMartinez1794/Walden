import { createHTTPSServer, createHTTPRedirectServer } from './config/https.js';
import logger from './utils/logger.js';
import {
  loadEnvironment,
  validateSecurityPrerequisites,
  initializeInfrastructure,
  connectDatabase,
  shutdownInfrastructure,
} from './bootstrap.js';
import { scheduleClinicalWorkersStart, stopClinicalWorkers } from './workers/clinicalWorkers.js';

function closeServer(server, label) {
  return new Promise((resolve) => {
    if (!server) return resolve();
    server.close(() => {
      logger.info(`   → ${label} detenido`);
      resolve();
    });
  });
}

export async function startServer(app) {
  logger.info('\n═══════════════════════════════════════════════════════');
  logger.info('🚀 Iniciando Basileia Backend API');
  logger.info('═══════════════════════════════════════════════════════\n');

  loadEnvironment();
  await validateSecurityPrerequisites();
  await initializeInfrastructure();
  await connectDatabase();

  const port = process.env.PORT || 8000;
  const useHTTPS = process.env.USE_HTTPS === 'true';

  logger.info('\n🌐 [4/6] Configurando servidor web...');

  let httpServer = null;
  let httpsServer = null;
  let httpRedirectServer = null;

  if (useHTTPS) {
    httpsServer = await createHTTPSServer(app);
    httpRedirectServer = createHTTPRedirectServer();

    await new Promise((resolve) => {
      httpsServer.listen(port, () => {
        logger.info(`   ✓ Servidor HTTPS listo en https://localhost:${port}`);
        resolve();
      });
    });

    const httpPort = process.env.HTTP_REDIRECT_PORT || 8080;
    await new Promise((resolve) => {
      httpRedirectServer.listen(httpPort, () => {
        logger.info(`   ✓ Servidor de redireccion HTTP → HTTPS (puerto ${httpPort})`);
        resolve();
      });
    });
  } else {
    httpServer = await new Promise((resolve) => {
      const server = app.listen(port, () => {
        logger.info(`   ✓ Servidor HTTP listo en http://localhost:${port}`);
        logger.info(`   ✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
        resolve(server);
      });
    });
  }

  scheduleClinicalWorkersStart(1000);

  const gracefulShutdown = async (signal) => {
    logger.info(`\n\n⚠️  ${signal} recibido. Iniciando apagado controlado...`);

    try {
      await stopClinicalWorkers();
      await closeServer(httpRedirectServer, 'HTTP redirect server');
      await closeServer(httpsServer, 'HTTPS server');
      await closeServer(httpServer, 'HTTP server');
      await shutdownInfrastructure();
      logger.info('\n✅ Apagado controlado completado exitosamente\n');
      process.exit(0);
    } catch (error) {
      logger.error('\n❌ Error durante el apagado:', error.message);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

  return { httpServer, httpsServer, httpRedirectServer };
}
