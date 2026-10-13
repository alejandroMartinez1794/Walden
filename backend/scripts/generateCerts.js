#!/usr/bin/env node

/**
 * Generate a self-signed TLS certificate for local development only.
 * Requires the OpenSSL command-line utility to be installed.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certsDir = path.join(__dirname, '../certs');
const certPath = path.join(certsDir, 'dev-cert.pem');
const keyPath = path.join(certsDir, 'dev-key.pem');

fs.mkdirSync(certsDir, { recursive: true });

console.log('Generating self-signed certificate for local development...');
try {
  execFileSync('openssl', [
    'req', '-x509', '-nodes', '-newkey', 'rsa:2048',
    '-keyout', keyPath,
    '-out', certPath,
    '-days', '365',
    '-subj', '/C=CO/ST=Cundinamarca/L=Bogota/O=basileia Development/OU=Development/CN=localhost',
    '-addext', 'subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1',
    '-addext', 'basicConstraints=critical,CA:FALSE',
    '-addext', 'keyUsage=digitalSignature,keyEncipherment',
    '-addext', 'extendedKeyUsage=serverAuth'
  ], { stdio: 'inherit' });
} catch (error) {
  console.error('Could not generate the development certificate. Ensure OpenSSL is installed and available on PATH.');
  process.exitCode = 1;
  throw error;
}

console.log('Development certificate generated:');
console.log(`  Certificate: ${certPath}`);
console.log(`  Private key: ${keyPath}`);
console.log('Use these self-signed certificates only for local development.');
