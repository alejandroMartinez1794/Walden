import crypto from 'crypto';

const algorithm = 'aes-256-gcm'; // Changed from aes-256-cbc to aes-256-gcm for authenticated encryption
const deriveKey = () => {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is required for clinical data encryption');
  }

  return crypto.scryptSync(encryptionKey, 'clinical-data-encryption-salt', 32);
};

const getKey = () => deriveKey();

/**
 * Cifra un texto plano usando AES-256-GCM.
 * @param {string} text - Texto a cifrar (ej: diagnóstico, notas).
 * @returns {string} - Texto cifrado en formato iv:tag:content (hex).
 */
export const encryptClinicalData = (text) => {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag(); // Get authentication tag for GCM
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Descifra un texto cifrado.
 * @param {string} text - Texto cifrado en formato iv:tag:content.
 * @returns {string} - Texto plano original.
 */
export const decryptClinicalData = (text) => {
  if (!text || (text.match(/:/g) || []).length < 2) return text; // Ensure we have at least 2 colons
  const [ivHex, tagHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  decipher.setAuthTag(authTag); // Set authentication tag for GCM
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const encrypt = encryptClinicalData;
export const decrypt = decryptClinicalData;