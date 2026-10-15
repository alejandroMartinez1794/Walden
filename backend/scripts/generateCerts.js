#!/usr/bin/env node

/**
 * Generate a self-signed TLS certificate for local development only.
 * Requires the OpenSSL CLI. Never use this certificate in staging or production.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const certsDir = path.join(here, '../certs');
const certPath = path.join(certsDir, 'dev-cert.pem');
const keyPath = path.join(certsDir, 'dev-key.pem');

fs.mkdirSync(certsDir, { recursive: true });

execFileSync('openssl', [
  'req',
  '-x509',
  '-newkey', 'rsa:2048',
  '-nodes',
  '-keyout', keyPath,
  '-out', certPath,
  '-days', '365',
  '-subj', '/C=CO/ST=Cundinamarca/L=Bogota/O=Basileia Development/OU=Development/CN=localhost',
  '-addext', 'basicConstraints=critical,CA:FALSE',
  '-addext', 'keyUsage=critical,digitalSignature,keyEncipherment',
  '-addext', 'extendedKeyUsage=serverAuth',
  '-addext', 'subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0:0:0:0:0:0:0:1',
], { stdio: 'inherit' });

console.log('Self-signed development certificate created:');
console.log(`  Certificate: ${certPath}`);
console.log(`  Private key: ${keyPath}`);
console.warn('Development only. Use a trusted certificate for staging/production.');
