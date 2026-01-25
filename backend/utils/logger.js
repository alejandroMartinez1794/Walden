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
 * Logger real con Winston y rotación de archivos
 */
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const transports = [
  new winston.transports.Console({
    level: LOG_LEVEL,
    format: NODE_ENV === 'production' ? jsonFormat : prettyFormat
  })
];

if (NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'psiconepsis-api' },
  format: jsonFormat,
  transports
});

export default logger;
