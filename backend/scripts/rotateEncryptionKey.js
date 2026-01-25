/**
 * 🔐 ENCRYPTION KEY ROTATION UTILITY
 * 
 * Herramienta para rotar la clave de encriptación de datos clínicos
 * 
 * ¿Por qué rotar claves?
 * - Compliance HIPAA: Rotación periódica requerida
 * - Seguridad: Limitar impacto de compromiso de clave
 * - Best practice: Rotación cada 90 días
 * 
 * Proceso:
 * 1. Generar nueva clave
 * 2. Re-encriptar todos los datos con nueva clave
 * 3. Actualizar secreto en backend (AWS/Vault/etc)
 * 4. Guardar clave antigua para rollback
 * 
 * Uso:
 * ```bash
 * node backend/scripts/rotateEncryptionKey.js
 * ```
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import logger from '../utils/logger.js';
import { decrypt, encrypt } from '../utils/clinicalCrypto.js';

dotenv.config({ path: '.env.local' });

const OLD_KEY = process.env.ENCRYPTION_KEY;
const NEW_KEY = crypto.randomBytes(32).toString('hex');

/**
 * Re-encriptar un documento con nueva clave
 */
const reencryptDocument = async (doc, oldKey, newKey) => {
  try {
    // Campos encriptados en PsychologicalClinicalHistory
    const encryptedFields = [
      'traumaHistory',
      'previousPsychiatricHistory',
      'familyHistory',
      'currentSymptoms',
      'riskFactors'
    ];

    let modified = false;

    for (const field of encryptedFields) {
      if (doc[field]) {
        try {
          // Desencriptar con clave antigua
          const decrypted = decrypt(doc[field], oldKey);
          
          // Re-encriptar con clave nueva
          const reencrypted = encrypt(decrypted, newKey);
          
          // Actualizar documento
          doc[field] = reencrypted;
          modified = true;
          
        } catch (decryptError) {
          logger.warn(`Field ${field} might not be encrypted or already using new key`, {
            documentId: doc._id,
            field
          });
        }
      }
    }

    if (modified) {
      await doc.save();
      return true;
    }

    return false;
    
  } catch (error) {
    logger.error(`Error re-encrypting document ${doc._id}`, {
      error: error.message
    });
    return false;
  }
};

/**
 * Main rotation process
 */
const rotateKey = async () => {
  try {
    logger.info('🔐 Starting encryption key rotation...');
    logger.info(`Old key: ${OLD_KEY.substring(0, 8)}...`);
    logger.info(`New key: ${NEW_KEY.substring(0, 8)}...`);

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    logger.info('Connected to MongoDB');

    // Obtener todos los documentos con datos encriptados
    const histories = await PsychologicalClinicalHistory.find({});
    logger.info(`Found ${histories.length} clinical histories to re-encrypt`);

    let reencrypted = 0;
    let skipped = 0;
    let failed = 0;

    // Re-encriptar cada documento
    for (const history of histories) {
      const success = await reencryptDocument(history, OLD_KEY, NEW_KEY);
      
      if (success) {
        reencrypted++;
        logger.info(`✅ Re-encrypted ${history._id}`);
      } else {
        skipped++;
        logger.warn(`⚠️ Skipped ${history._id}`);
      }
    }

    logger.info('🎉 Key rotation completed');
    logger.info(`Results: ${reencrypted} re-encrypted, ${skipped} skipped, ${failed} failed`);
    logger.info('');
    logger.info('🔑 NEXT STEPS:');
    logger.info('1. Update ENCRYPTION_KEY in your secrets backend:');
    logger.info(`   ENCRYPTION_KEY=${NEW_KEY}`);
    logger.info('');
    logger.info('2. Save old key for rollback (if needed):');
    logger.info(`   ENCRYPTION_KEY_OLD=${OLD_KEY}`);
    logger.info('');
    logger.info('3. Restart backend to use new key');

    await mongoose.disconnect();
    
  } catch (error) {
    logger.error('❌ Key rotation failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  rotateKey();
}

export default rotateKey;
