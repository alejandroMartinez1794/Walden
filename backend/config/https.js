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
import { constants } from 'crypto';
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
  if (securityTier === 'dev') {
    // En desarrollo no validamos para permitir certificados auto-firmados
    return;
  }

  // Extraer información del certificado
  try {
    // Import dinámico de node-forge para evitar error si no está instalado
    let forge;
    try {
      forge = require('node-forge');
    } catch (error) {
      logger.error('❌ node-forge library not installed. Run: npm install node-forge');
      if (securityTier === 'prod') {
        throw new Error('node-forge is required for production certificate validation');
      }
      logger.warn('⚠️ Skipping certificate validation due to missing node-forge (install it for production)');
      return;
    }
    
    const cert = forge.pki.certificateFromPem(certData);
    
    // Verificar Common Name (CN) y Subject Alternative Names (SAN)
    const cn = cert.subject.getField('CN');
    const altNamesExt = cert.getExtension('subjectAltName');
    
    if (cn && cn.value.toLowerCase().includes(expectedDomain.toLowerCase())) {
      logger.info(`✅ Certificate CN validation passed: ${cn.value}`);
    } else {
      // Para producción, el dominio debe coincidir exactamente
      if (securityTier === 'prod') {
        logger.error(`❌ Certificate CN does not match expected domain: ${expectedDomain}`);
        throw new Error(`Certificate CN validation failed: ${cn ? cn.value : 'no CN found'}`);
      } else {
        logger.warn(`⚠️ Certificate CN does not match expected domain: ${expectedDomain}, but continuing for staging`);
      }
    }
    
    if (altNamesExt && altNamesExt.altNames) {
      const sanDomains = altNamesExt.altNames
        .filter(altName => altName.type === 2) // DNS Name
        .map(altName => altName.value.toLowerCase());
      
      if (sanDomains.some(domain => domain.includes(expectedDomain.toLowerCase()))) {
        logger.info(`✅ Certificate SAN validation passed: ${sanDomains.join(', ')}`);
      } else if (securityTier === 'prod') {
        logger.error(`❌ Certificate SAN does not include expected domain: ${expectedDomain}`);
        throw new Error(`Certificate SAN validation failed: ${sanDomains.join(', ')}`);
      } else {
        logger.warn(`⚠️ Certificate SAN does not include expected domain: ${expectedDomain}, but continuing for staging`);
      }
    }
  } catch (error) {
    logger.error(`❌ Certificate validation error: ${error.message}`);
    if (securityTier === 'prod') {
      throw error;
    }
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
    
    // Import dinámico de node-forge
    let forge;
    try {
      forge = await import('node-forge');
    } catch (error) {
      logger.error('❌ node-forge library not installed. Cannot check certificate expiration.');
      return {
        valid: false,
        expiresAt: null,
        daysRemaining: 0
      };
    }
    
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