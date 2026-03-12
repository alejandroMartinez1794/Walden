import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
// En producción, esta clave debe venir de un Secret Manager, nunca hardcoded.
// Usamos un hash del JWT_SECRET para garantizar consistencia si no hay variable específica.
const key = crypto.scryptSync(process.env.JWT_SECRET_KEY || 'basileias_fallback_secret', 'salt', 32);

/**
 * Cifra un texto plano usando AES-256-CBC.
 * @param {string} text - Texto a cifrar (ej: diagnóstico, notas).
 * @returns {string} - Texto cifrado en formato iv:content (hex).
 */
export const encryptClinicalData = (text) => {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Descifra un texto cifrado.
 * @param {string} text - Texto cifrado en formato iv:content.
 * @returns {string} - Texto plano original.
 */
export const decryptClinicalData = (text) => {
  if (!text || !text.includes(':')) return text;
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
