import User from '../models/UserSchema.js';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import Booking from '../models/BookingSchema.js';
import logger from '../utils/logger.js';

class DataRetentionService {
  constructor() {
    this.retentionPeriod = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
  }

  /**
   * Find and mark expired data for deletion according to retention policy
   */
  async findExpiredData() {
    try {
      const cutoffDate = new Date(Date.now() - this.retentionPeriod);
      
      // Find users whose data retention has expired
      const expiredUsers = await User.find({
        dataRetentionExpiresAt: { $lt: cutoffDate },
        isDeleted: true // Only process already deleted accounts
      });
      
      // Find clinical histories that have expired
      const expiredClinicalHistories = await PsychologicalClinicalHistory.find({
        dataRetentionExpiresAt: { $lt: cutoffDate },
        isDeleted: true // Only process already marked deleted records
      });
      
      logger.info(`Found ${expiredUsers.length} expired users and ${expiredClinicalHistories.length} expired clinical histories for cleanup`);
      
      return {
        users: expiredUsers,
        clinicalHistories: expiredClinicalHistories
      };
    } catch (error) {
      logger.error('Error finding expired data', { error: error.message });
      throw error;
    }
  }

  /**
   * Permanently delete expired user data
   */
  async permanentlyDeleteExpiredUserData(expiredUsers) {
    try {
      const userIds = expiredUsers.map(user => user._id);
      
      if (userIds.length === 0) {
        logger.info('No expired users to delete');
        return { deletedCount: 0 };
      }

      // Delete expired users
      const result = await User.deleteMany({ _id: { $in: userIds } });
      
      logger.info(`Permanently deleted ${result.deletedCount} expired user records`);
      
      return result;
    } catch (error) {
      logger.error('Error permanently deleting expired user data', { error: error.message });
      throw error;
    }
  }

  /**
   * Permanently delete expired clinical history data
   */
  async permanentlyDeleteExpiredClinicalData(expiredClinicalHistories) {
    try {
      const historyIds = expiredClinicalHistories.map(history => history._id);
      
      if (historyIds.length === 0) {
        logger.info('No expired clinical histories to delete');
        return { deletedCount: 0 };
      }

      // Delete expired clinical histories
      const result = await PsychologicalClinicalHistory.deleteMany({ _id: { $in: historyIds } });
      
      logger.info(`Permanently deleted ${result.deletedCount} expired clinical history records`);
      
      return result;
    } catch (error) {
      logger.error('Error permanently deleting expired clinical data', { error: error.message });
      throw error;
    }
  }

  /**
   * Run the complete retention cleanup process
   */
  async runCleanup() {
    try {
      logger.info('Starting data retention cleanup process');
      
      // Find expired data
      const expiredData = await this.findExpiredData();
      
      // Permanently delete expired user data
      await this.permanentlyDeleteExpiredUserData(expiredData.users);
      
      // Permanently delete expired clinical history data
      await this.permanentlyDeleteExpiredClinicalData(expiredData.clinicalHistories);
      
      logger.info('Data retention cleanup process completed successfully');
      
      return {
        success: true,
        processed: {
          users: expiredData.users.length,
          clinicalHistories: expiredData.clinicalHistories.length
        }
      };
    } catch (error) {
      logger.error('Error running data retention cleanup', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Schedule regular cleanup (runs daily)
   */
  scheduleCleanup() {
    // Run cleanup immediately
    this.runCleanup();
    
    // Schedule daily cleanup
    const interval = 24 * 60 * 60 * 1000; // 24 hours
    
    setInterval(async () => {
      try {
        await this.runCleanup();
      } catch (error) {
        logger.error('Scheduled data retention cleanup failed', { error: error.message });
      }
    }, interval);
    
    logger.info('Data retention cleanup scheduled to run daily');
  }

  /**
   * Update retention expiry date for a user when they are deleted
   */
  async updateRetentionExpiryOnDeletion(userId) {
    try {
      const tenYearsFromNow = new Date();
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
      
      await User.findByIdAndUpdate(
        userId,
        { dataRetentionExpiresAt: tenYearsFromNow },
        { new: true }
      );
      
      logger.info(`Updated retention expiry for user ${userId} to ${tenYearsFromNow.toISOString()}`);
    } catch (error) {
      logger.error('Error updating retention expiry on deletion', { error: error.message, userId });
      throw error;
    }
  }
}

// Create and export singleton instance
export const dataRetentionService = new DataRetentionService();

export default dataRetentionService;

