/**
 * 🚨 BACKUP AND DISASTER RECOVERY SCRIPT
 * 
 * Automated clinical data backup with encryption and DRP compliance
 * Aligns with Ley 1581/2019 and MinSalud requirements
 * RPO <= 1h, RTO <= 15 min
 */

import { exec } from 'child_process';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import cron from 'node-cron';
import axios from 'axios';
import { encrypt } from '../utils/clinicalCrypto.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Backup retention: 10 years as per Ley 1581/2012 and MinSalud
  RETENTION_YEARS: 10,
  RETENTION_DAYS: 365 * 10, // 10 years in days
  
  // RPO (Recovery Point Objective): <= 1 hour
  BACKUP_INTERVAL: '0 * * * *', // Every hour
  
  // RTO (Recovery Time Objective): <= 15 minutes
  RESTORE_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // Storage location
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'),
  
  // Database connection
  MONGODB_URI: process.env.MONGO_URL || process.env.MONGODB_URI,
  
  // Remote storage (optional)
  REMOTE_STORAGE: {
    enabled: process.env.REMOTE_BACKUP_ENABLED === 'true',
    endpoint: process.env.REMOTE_BACKUP_ENDPOINT,
    apiKey: process.env.REMOTE_BACKUP_APIKEY
  }
};

class BackupAndDR {
  constructor() {
    this.backupDir = CONFIG.BACKUP_DIR;
    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Create encrypted backup of clinical data
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbName = this.extractDbName(CONFIG.MONGODB_URI);
    const backupFileName = `clinical-backup-${dbName}-${timestamp}.gz`;
    const backupPath = path.join(this.backupDir, backupFileName);

    logger.info('Starting clinical data backup', {
      fileName: backupFileName,
      timestamp
    });

    try {
      // Use mongodump to create backup
      const mongodumpArgs = [
        '--uri', CONFIG.MONGODB_URI,
        '--gzip',
        '--archive=' + backupPath,
        '--excludeCollection', 'sessions',  // Exclude temporary sessions
        '--excludeCollection', 'cache'     // Exclude cache data
      ];

      const dumpProcess = spawn('mongodump', mongodumpArgs);
      
      // Handle process events
      dumpProcess.stdout.on('data', (data) => {
        logger.debug(`mongodump stdout: ${data}`);
      });

      dumpProcess.stderr.on('data', (data) => {
        logger.warn(`mongodump stderr: ${data}`);
      });

      await new Promise((resolve, reject) => {
        dumpProcess.on('close', (code) => {
          if (code === 0) {
            logger.info(`Backup created successfully: ${backupPath}`);
            resolve(backupPath);
          } else {
            reject(new Error(`mongodump exited with code ${code}`));
          }
        });
      });

      // Encrypt the backup file
      await this.encryptBackup(backupPath);
      
      // Upload to remote storage if configured
      if (CONFIG.REMOTE_STORAGE.enabled) {
        await this.uploadToRemote(backupPath + '.enc');
      }

      // Clean old backups beyond retention period
      await this.cleanupOldBackups();

      logger.info('Backup process completed successfully', {
        backupFile: backupFileName + '.enc',
        size: await this.getFileSize(backupPath + '.enc')
      });

      return backupPath + '.enc';
    } catch (error) {
      logger.error('Backup creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Encrypt backup file
   */
  async encryptBackup(backupPath) {
    logger.info('Encrypting backup file', { path: backupPath });
    
    try {
      const fs = await import('fs');
      const data = fs.readFileSync(backupPath);
      const encryptedData = encrypt(data.toString('base64'));
      
      // Write encrypted data to new file with .enc extension
      fs.writeFileSync(backupPath + '.enc', encryptedData);
      
      // Remove unencrypted backup
      fs.unlinkSync(backupPath);
      
      logger.info('Backup encrypted successfully', { path: backupPath + '.enc' });
    } catch (error) {
      logger.error('Backup encryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload backup to remote storage
   */
  async uploadToRemote(encryptedFilePath) {
    if (!CONFIG.REMOTE_STORAGE.enabled) {
      logger.info('Remote backup disabled');
      return;
    }

    try {
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(encryptedFilePath);
      
      const response = await axios.post(
        CONFIG.REMOTE_STORAGE.endpoint,
        fileBuffer,
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.REMOTE_STORAGE.apiKey}`,
            'Content-Type': 'application/octet-stream',
            'X-Backup-Timestamp': new Date().toISOString(),
            'X-Backup-Type': 'clinical-data'
          },
          timeout: 300000 // 5 minutes timeout
        }
      );

      logger.info('Backup uploaded to remote storage', {
        status: response.status,
        remoteId: response.data?.id
      });
    } catch (error) {
      logger.error('Remote backup upload failed', {
        error: error.message,
        endpoint: CONFIG.REMOTE_STORAGE.endpoint
      });
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupFile) {
    logger.info('Starting restore process', { backupFile });

    try {
      // Decrypt the backup file
      const decryptedPath = await this.decryptBackup(backupFile);
      
      // Use mongorestore to restore data
      const dbName = this.extractDbName(CONFIG.MONGODB_URI);
      const mongorestoreArgs = [
        '--uri', CONFIG.MONGODB_URI,
        '--drop',  // Drop existing collections before restoring
        '--gzip',
        '--archive=' + decryptedPath
      ];

      const restoreProcess = spawn('mongorestore', mongorestoreArgs);
      
      // Handle process events
      restoreProcess.stdout.on('data', (data) => {
        logger.debug(`mongorestore stdout: ${data}`);
      });

      restoreProcess.stderr.on('data', (data) => {
        logger.warn(`mongorestore stderr: ${data}`);
      });

      await new Promise((resolve, reject) => {
        restoreProcess.on('close', (code) => {
          if (code === 0) {
            logger.info('Restore completed successfully');
            resolve();
          } else {
            reject(new Error(`mongorestore exited with code ${code}`));
          }
        });
      });

      // Clean up temporary decrypted file
      const fs = await import('fs');
      fs.unlinkSync(decryptedPath);

      logger.info('Restore process completed successfully');
    } catch (error) {
      logger.error('Restore process failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Decrypt backup file
   */
  async decryptBackup(encryptedFilePath) {
    logger.info('Decrypting backup file', { path: encryptedFilePath });
    
    try {
      const fs = await import('fs');
      const cryptoModule = await import('../utils/clinicalCrypto.js');
      
      const encryptedData = fs.readFileSync(encryptedFilePath, 'utf8');
      const decryptedBase64 = cryptoModule.decrypt(encryptedData);
      const decryptedData = Buffer.from(decryptedBase64, 'base64');
      
      // Write decrypted data to temp file
      const decryptedPath = encryptedFilePath.replace('.enc', '.decrypted');
      fs.writeFileSync(decryptedPath, decryptedData);
      
      logger.info('Backup decrypted successfully', { path: decryptedPath });
      return decryptedPath;
    } catch (error) {
      logger.error('Backup decryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Clean up old backups beyond retention period
   */
  async cleanupOldBackups() {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      
      const files = fs.readdirSync(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION_DAYS);

      for (const file of files) {
        if (file.endsWith('.enc')) {
          const filePath = pathModule.join(this.backupDir, file);
          const stat = fs.statSync(filePath);
          const fileDate = new Date(stat.mtime);

          if (fileDate < cutoffDate) {
            fs.unlinkSync(filePath);
            logger.info('Removed expired backup', { file: filePath });
          }
        }
      }
    } catch (error) {
      logger.error('Failed to clean up old backups', { error: error.message });
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath) {
    const fs = await import('fs');
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  /**
   * Extract database name from MongoDB URI
   */
  extractDbName(uri) {
    try {
      const url = new URL(uri);
      return url.pathname.substring(1); // Remove leading slash
    } catch (error) {
      logger.error('Failed to extract database name from URI', { uri });
      throw error;
    }
  }

  /**
   * Schedule automated backups
   */
  scheduleBackups() {
    logger.info('Scheduling automated backups', {
      interval: CONFIG.BACKUP_INTERVAL,
      retentionDays: CONFIG.RETENTION_DAYS
    });

    cron.schedule(CONFIG.BACKUP_INTERVAL, async () => {
      try {
        await this.createBackup();
        logger.info('Scheduled backup completed successfully');
      } catch (error) {
        logger.error('Scheduled backup failed', { error: error.message });
      }
    });
  }

  /**
   * Run backup verification test
   */
  async runVerificationTest() {
    logger.info('Starting backup verification test');
    
    try {
      // Create a test backup
      const testBackup = await this.createBackup();
      
      // Verify the backup exists and has content
      const fs = await import('fs');
      if (!fs.existsSync(testBackup)) {
        throw new Error('Test backup file does not exist');
      }
      
      const fileSize = fs.statSync(testBackup).size;
      if (fileSize === 0) {
        throw new Error('Test backup file is empty');
      }
      
      logger.info('Backup verification test passed', {
        backupFile: testBackup,
        size: fileSize
      });
      
      return true;
    } catch (error) {
      logger.error('Backup verification test failed', { error: error.message });
      return false;
    }
  }
}

// Create and configure the backup system
const backupSystem = new BackupAndDR();

// If running directly, perform requested action
if (process.argv[1] === __filename) {
  const action = process.argv[2];

  switch (action) {
    case 'backup':
      backupSystem.createBackup()
        .catch(err => {
          logger.error('Backup command failed', { error: err.message });
          process.exit(1);
        });
      break;

    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('Usage: node backup-dr.js restore <backup-file>');
        process.exit(1);
      }
      backupSystem.restoreFromBackup(backupFile)
        .catch(err => {
          logger.error('Restore command failed', { error: err.message });
          process.exit(1);
        });
      break;

    case 'schedule':
      backupSystem.scheduleBackups();
      logger.info('Backup scheduling initiated');
      break;

    case 'verify':
      backupSystem.runVerificationTest()
        .then(success => {
          process.exit(success ? 0 : 1);
        })
        .catch(err => {
          logger.error('Verification command failed', { error: err.message });
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node backup-dr.js [backup|restore|schedule|verify]');
      console.log('  backup   - Create an immediate backup');
      console.log('  restore  - Restore from specified backup file');
      console.log('  schedule - Schedule automated backups');
      console.log('  verify   - Run verification test');
      process.exit(1);
  }
}

export default backupSystem;