/**
 * 🔒 HTTPS SERVER CONFIGURATION
 * 
 * Configuración de servidor HTTPS para producción
 * 
 * Características:
 * - TLS 1.3 (más seguro)
 * - Certificados SSL (Let's Encrypt o custom)
 * - Validación criptográfica de certificados
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
import tls from 'tls';
import { constants, X509Certificate } from 'crypto';
import logger from '../utils/logger.js';

/**
 * 🔑 Cargar y validar certificados SSL
 * 
 * Prioridad:
 * 1. Certificados de Let's Encrypt (/etc/letsencrypt/)
 * 2. Certificados custom (./certs/)
 * 3. Certificados auto-firmados (solo desarrollo)
 * 
 * @returns {{ key: Buffer, cert: Buffer, ca?: Buffer }}
 */
export const loadSSLCertificates = () => {
  const securityTier = process.env.SECURITY_TIER || 'dev';
  const domain = process.env.DOMAIN || 'localhost';
  
  // Validación fail-fast de tier de seguridad
  if (!['dev', 'staging', 'prod'].includes(securityTier)) {
    logger.error('❌ Invalid SECURITY_TIER. Expected: dev, staging, or prod');
    throw new Error('Invalid SECURITY_TIER configuration');
  }

  // Desarrollo: Certificados auto-firmados
  if (securityTier === 'dev') {
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
  
  // Staging y producción: Requieren certificados válidos con validación
  const certBasePath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live';
  const domainFromEnv = process.env.DOMAIN || 'api.basileia.com';
  
  const letsEncryptPath = path.join(certBasePath, domainFromEnv);
  const customCertPath = './certs';
  
  // Intentar Let's Encrypt primero
  if (fs.existsSync(letsEncryptPath)) {
    logger.info(`✅ Loading Let's Encrypt certificates for ${domainFromEnv}`);
    
    const certPath = path.join(letsEncryptPath, 'fullchain.pem');
    const keyPath = path.join(letsEncryptPath, 'privkey.pem');
    
    const certData = fs.readFileSync(certPath, 'utf8');
    validateCertificate(certData, domainFromEnv, securityTier);
    
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }
  
  // Intentar certificados custom
  const customKey = path.join(customCertPath, 'server.key');
  const customCert = path.join(customCertPath, 'server.crt');
  const customCA = path.join(customCertPath, 'ca.crt');
  
  if (fs.existsSync(customKey) && fs.existsSync(customCert)) {
    logger.info('✅ Loading custom SSL certificates');
    
    const certData = fs.readFileSync(customCert, 'utf8');
    validateCertificate(certData, domainFromEnv, securityTier);
    
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
  logger.error('❌ SSL certificates not found in staging/production');
  logger.error(`Tried paths:`);
  logger.error(`- Let's Encrypt: ${letsEncryptPath}`);
  logger.error(`- Custom: ${customCertPath}`);
  logger.info('See backend/HTTPS_SETUP.md for configuration instructions');
  
  throw new Error('SSL certificates not found for production');
};

/**
 * Validar certificado contra dominio esperado
 * @param {string} certData - Contenido del certificado
 * @param {string} expectedDomain - Dominio esperado
 * @param {string} securityTier - Tier de seguridad
 */
const validateCertificate = (certData, expectedDomain, securityTier) => {
  if (securityTier === 'dev') return;

  try {
    // Node's built-in X509Certificate parser avoids the vulnerable node-forge
    // dependency and validates the expected hostname against SAN/CN rules.
    const certificate = new X509Certificate(certData);
    const matchingHost = certificate.checkHost(expectedDomain, { subject: 'never' });

    if (!matchingHost) {
      const message = `Certificate SAN does not match expected domain: ${expectedDomain}`;
      if (securityTier === 'prod') throw new Error(message);
      logger.warn(`⚠️ ${message}; continuing for staging`);
      return;
    }

    const now = Date.now();
    const notBefore = Date.parse(certificate.validFrom);
    const notAfter = Date.parse(certificate.validTo);
    if (!Number.isFinite(notBefore) || !Number.isFinite(notAfter) || now < notBefore || now > notAfter) {
      const message = 'Certificate is not currently valid';
      if (securityTier === 'prod') throw new Error(message);
      logger.warn(`⚠️ ${message}; continuing for staging`);
      return;
    }

    logger.info(`✅ Certificate hostname and validity checks passed for ${expectedDomain}`);
  } catch (error) {
    logger.error(`❌ Certificate validation error: ${error.message}`);
    if (securityTier === 'prod') throw error;
    logger.warn('⚠️ Certificate validation failed in staging; continuing with warning');
  }
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
 * ⚙️ Middleware: Forzar HTTPS en staging y producción
 * 
 * Redirige HTTP → HTTPS o devuelve 403 según tier de seguridad
 * 
 * Uso:
 * ```javascript
 * app.use(forceHTTPS);
 * ```
 */
export const forceHTTPS = (req, res, next) => {
  const securityTier = process.env.SECURITY_TIER || 'dev';
  
  // En desarrollo no forzamos HTTPS
  if (securityTier === 'dev') {
    return next();
  }
  
  // Verificar si ya está en HTTPS
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure) {
    if (securityTier === 'prod' || securityTier === 'staging') {
      // En staging y prod, forzamos HTTPS con redirect 301
      const protocol = process.env.NODE_ENV === 'test' ? 'https' : req.protocol;
      const redirectUrl = `https://${req.headers.host}${req.url}`;
      logger.debug(`Forcing HTTPS in ${securityTier}: ${req.url} → ${redirectUrl}`);
      
      return res.redirect(301, redirectUrl);
    } else {
      // Para otros tiers, devolver error 403
      logger.warn(`HTTPS required for security tier: ${securityTier}`);
      return res.status(403).json({
        error: 'HTTPS required for this service tier',
        tier: securityTier
      });
    }
  }
  
  next();
};

/**
 * 🔒 Middleware: Security headers adicionales
 * 
 * Headers más allá de Helmet
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // HSTS (HTTP Strict Transport Security) con preload
  // Forzar HTTPS por 1 año con preload para navegador
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy (CSP) restrictivo
  // Bloquea unsafe-eval, frame-src: none, object-src: none
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "upgrade-insecure-requests;"
  );
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection (legacy pero aún útil)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (reemplaza Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), interest-cohort=()'
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
    const certificate = new X509Certificate(credentials.cert.toString());
    const expiresAt = new Date(certificate.validTo);
    const notBefore = Date.parse(certificate.validFrom);
    const now = Date.now();
    const daysRemaining = Math.floor((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24));
    const valid = Number.isFinite(notBefore) && now >= notBefore && daysRemaining >= 0;

    if (daysRemaining < 30) {
      logger.warn(`⚠️ SSL certificate expires in ${daysRemaining} days`);
    }

    return { valid, expiresAt, daysRemaining };
  } catch (error) {
    logger.error('Error checking certificate expiration', { error: error.message });
    return { valid: false, expiresAt: null, daysRemaining: 0 };
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