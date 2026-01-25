/**
 * 🔒 HTTPS SERVER CONFIGURATION
 * 
 * Configuración de servidor HTTPS para producción
 * 
 * Características:
 * - TLS 1.3 (más seguro)
 * - Certificados SSL (Let's Encrypt o custom)
 * - HSTS headers (forzar HTTPS)
 * - HTTP/2 support
 * - Redirect HTTP → HTTPS
 * 
 * Uso:
 * ```javascript
 * import { createHTTPSServer } from './config/https.js';
 * 
 * const server = createHTTPSServer(app);
 * server.listen(443, () => console.log('HTTPS server running'));
 * ```
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { constants } from 'crypto';
import logger from '../utils/logger.js';

/**
 * 🔑 Cargar certificados SSL
 * 
 * Prioridad:
 * 1. Certificados de Let's Encrypt (/etc/letsencrypt/)
 * 2. Certificados custom (./certs/)
 * 3. Certificados auto-firmados (solo desarrollo)
 * 
 * @returns {{ key: Buffer, cert: Buffer, ca?: Buffer }}
 */
export const loadSSLCertificates = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  // Desarrollo: Certificados auto-firmados
  if (NODE_ENV === 'development') {
    logger.warn('⚠️ Using self-signed certificates (DEVELOPMENT ONLY)');
    
    const certPath = './certs/dev-cert.pem';
    const keyPath = './certs/dev-key.pem';
    
    // Verificar si existen certificados de desarrollo
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      logger.error('❌ Development certificates not found');
      logger.info('Generate with: npm run generate-certs');
      throw new Error('SSL certificates not found');
    }
    
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }
  
  // Producción: Let's Encrypt o custom
  const certBasePath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live';
  const domain = process.env.DOMAIN || 'api.psiconepsis.com';
  
  const letsEncryptPath = path.join(certBasePath, domain);
  const customCertPath = './certs';
  
  // Intentar Let's Encrypt primero
  if (fs.existsSync(letsEncryptPath)) {
    logger.info(`✅ Loading Let's Encrypt certificates for ${domain}`);
    
    return {
      key: fs.readFileSync(path.join(letsEncryptPath, 'privkey.pem')),
      cert: fs.readFileSync(path.join(letsEncryptPath, 'fullchain.pem'))
    };
  }
  
  // Intentar certificados custom
  const customKey = path.join(customCertPath, 'server.key');
  const customCert = path.join(customCertPath, 'server.crt');
  const customCA = path.join(customCertPath, 'ca.crt');
  
  if (fs.existsSync(customKey) && fs.existsSync(customCert)) {
    logger.info('✅ Loading custom SSL certificates');
    
    const sslConfig = {
      key: fs.readFileSync(customKey),
      cert: fs.readFileSync(customCert)
    };
    
    // CA chain opcional
    if (fs.existsSync(customCA)) {
      sslConfig.ca = fs.readFileSync(customCA);
    }
    
    return sslConfig;
  }
  
  // No se encontraron certificados
  logger.error('❌ SSL certificates not found in production');
  logger.error(`Tried paths:`);
  logger.error(`- Let's Encrypt: ${letsEncryptPath}`);
  logger.error(`- Custom: ${customCertPath}`);
  logger.info('See backend/HTTPS_SETUP.md for configuration instructions');
  
  throw new Error('SSL certificates not found for production');
};

/**
 * 🔒 Crear servidor HTTPS
 * 
 * @param {Express} app - Express application
 * @returns {https.Server}
 */
export const createHTTPSServer = (app) => {
  try {
    const credentials = loadSSLCertificates();
    
    // Opciones de seguridad TLS
    const httpsOptions = {
      ...credentials,
      
      // TLS 1.3 only (más seguro)
      minVersion: 'TLSv1.3',
      maxVersion: 'TLSv1.3',
      
      // Ciphers recomendados (Mozilla Modern)
      ciphers: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256'
      ].join(':'),
      
      // Opciones adicionales de seguridad
      honorCipherOrder: true,
      secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
    };
    
    const httpsServer = https.createServer(httpsOptions, app);
    
    logger.info('✅ HTTPS server configured');
    
    return httpsServer;
    
  } catch (error) {
    logger.error('❌ Failed to create HTTPS server', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * 🔄 Crear servidor HTTP (redirect a HTTPS)
 * 
 * @returns {http.Server}
 */
export const createHTTPRedirectServer = () => {
  const httpServer = http.createServer((req, res) => {
    const host = req.headers.host;
    const redirectUrl = `https://${host}${req.url}`;
    
    logger.debug(`HTTP → HTTPS redirect: ${req.url} → ${redirectUrl}`);
    
    res.writeHead(301, {
      'Location': redirectUrl,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    });
    res.end();
  });
  
  return httpServer;
};

/**
 * ⚙️ Middleware: Forzar HTTPS en producción
 * 
 * Redirige HTTP → HTTPS automáticamente
 * 
 * Uso:
 * ```javascript
 * app.use(forceHTTPS);
 * ```
 */
export const forceHTTPS = (req, res, next) => {
  // Solo en producción
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Verificar si ya está en HTTPS
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure) {
    const redirectUrl = `https://${req.headers.host}${req.url}`;
    logger.debug(`Forcing HTTPS: ${req.url} → ${redirectUrl}`);
    
    return res.redirect(301, redirectUrl);
  }
  
  next();
};

/**
 * 🔒 Middleware: Security headers adicionales
 * 
 * Headers más allá de Helmet
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // HSTS (HTTP Strict Transport Security)
  // Forzar HTTPS por 1 año
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Expect-CT (Certificate Transparency)
  res.setHeader(
    'Expect-CT',
    'max-age=86400, enforce'
  );
  
  // Permissions Policy (reemplaza Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};

/**
 * 📊 Health check para certificados SSL
 * 
 * Verifica expiración de certificados
 * 
 * @returns {Promise<{valid: boolean, expiresAt: Date, daysRemaining: number}>}
 */
export const checkCertificateExpiration = async () => {
  try {
    const credentials = loadSSLCertificates();
    
    // Parsear certificado
    const forge = await import('node-forge');
    const cert = forge.default.pki.certificateFromPem(credentials.cert.toString());
    
    const expiresAt = cert.validity.notAfter;
    const now = new Date();
    const daysRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    const valid = daysRemaining > 0;
    
    if (daysRemaining < 30) {
      logger.warn(`⚠️ SSL certificate expires in ${daysRemaining} days`);
    }
    
    return {
      valid,
      expiresAt,
      daysRemaining
    };
    
  } catch (error) {
    logger.error('Error checking certificate expiration', {
      error: error.message
    });
    
    return {
      valid: false,
      expiresAt: null,
      daysRemaining: 0
    };
  }
};

export default {
  loadSSLCertificates,
  createHTTPSServer,
  createHTTPRedirectServer,
  forceHTTPS,
  additionalSecurityHeaders,
  checkCertificateExpiration
};
