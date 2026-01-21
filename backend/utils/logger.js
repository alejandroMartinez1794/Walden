/**
 * 📊 LOGGER UTILITY
 * 
 * Sistema de logging estructurado con Winston
 * 
 * ¿Por qué no usar console.log?
 * - console.log no tiene niveles (info, warn, error)
 * - No tiene timestamps automáticos
 * - No se puede filtrar o buscar fácilmente
 * - No se puede enviar a servicios externos (Datadog, Sentry)
 * 
 * Niveles de logging:
 * - error: Errores críticos que requieren atención
 * - warn: Advertencias, cosas sospechosas pero no críticas
 * - info: Información general (producción)
 * - debug: Debugging detallado (solo desarrollo)
 * 
 * TODO: Instalar Winston en fase de monitoring
 * Por ahora, usar console.log con formato mejorado
 */

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = process.env.LOG_LEVEL || 'info';
const currentLevelNum = levels[currentLevel] || levels.info;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
};

const logger = {
  error: (message, meta) => {
    if (levels.error <= currentLevelNum) {
      console.error(formatMessage('error', message, meta));
    }
  },
  
  warn: (message, meta) => {
    if (levels.warn <= currentLevelNum) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  
  info: (message, meta) => {
    if (levels.info <= currentLevelNum) {
      console.log(formatMessage('info', message, meta));
    }
  },
  
  debug: (message, meta) => {
    if (levels.debug <= currentLevelNum) {
      console.log(formatMessage('debug', message, meta));
    }
  }
};

export default logger;
