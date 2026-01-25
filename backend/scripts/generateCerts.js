#!/usr/bin/env node

/**
 * 🔐 GENERATE SELF-SIGNED CERTIFICATES
 * 
 * Script para generar certificados SSL auto-firmados para desarrollo
 * 
 * ⚠️ SOLO PARA DESARROLLO - No usar en producción
 * 
 * Uso:
 * ```bash
 * npm run generate-certs
 * # o
 * node backend/scripts/generateCerts.js
 * ```
 */

import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERTS_DIR = path.join(__dirname, '../certs');
const CERT_PATH = path.join(CERTS_DIR, 'dev-cert.pem');
const KEY_PATH = path.join(CERTS_DIR, 'dev-key.pem');

console.log('🔐 Generating self-signed certificates for development...\n');

// Crear directorio de certificados
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
  console.log('✅ Created certs directory');
}

// Generar par de claves RSA
console.log('🔑 Generating RSA key pair (2048 bits)...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// Crear certificado
console.log('📄 Creating certificate...');
const cert = forge.pki.createCertificate();

// Configurar certificado
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Válido por 1 año

// Atributos del certificado
const attrs = [
  {
    name: 'commonName',
    value: 'localhost'
  },
  {
    name: 'countryName',
    value: 'CO'
  },
  {
    shortName: 'ST',
    value: 'Cundinamarca'
  },
  {
    name: 'localityName',
    value: 'Bogota'
  },
  {
    name: 'organizationName',
    value: 'Psiconepsis Development'
  },
  {
    shortName: 'OU',
    value: 'Development'
  }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Extensiones del certificado
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  },
  {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  },
  {
    name: 'nsCertType',
    server: true,
    client: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  },
  {
    name: 'subjectAltName',
    altNames: [
      {
        type: 2, // DNS
        value: 'localhost'
      },
      {
        type: 2,
        value: '*.localhost'
      },
      {
        type: 7, // IP
        ip: '127.0.0.1'
      },
      {
        type: 7,
        ip: '::1'
      }
    ]
  },
  {
    name: 'subjectKeyIdentifier'
  }
]);

// Auto-firmar certificado
cert.sign(keys.privateKey, forge.md.sha256.create());

// Convertir a PEM
const pemCert = forge.pki.certificateToPem(cert);
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

// Guardar archivos
fs.writeFileSync(CERT_PATH, pemCert);
fs.writeFileSync(KEY_PATH, pemKey);

console.log('✅ Certificates generated successfully!\n');
console.log('📁 Files created:');
console.log(`   - Certificate: ${CERT_PATH}`);
console.log(`   - Private Key: ${KEY_PATH}`);
console.log('\n⚠️  IMPORTANT:');
console.log('   - These certificates are SELF-SIGNED');
console.log('   - ONLY use for local development');
console.log('   - Browsers will show security warnings (this is normal)');
console.log('   - For production, use Let\'s Encrypt or commercial certificates');
console.log('\n🚀 Next steps:');
console.log('   1. Start backend with HTTPS: npm run start-https');
console.log('   2. Accept browser security warning');
console.log('   3. Access: https://localhost:8000');
console.log('\n📚 Documentation: backend/HTTPS_SETUP.md');
