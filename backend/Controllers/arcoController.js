import User from '../models/UserSchema.js';
import Booking from '../models/BookingSchema.js';
import PsychologicalClinicalHistory from '../models/PsychologicalClinicalHistorySchema.js';
import { dataRetentionService } from '../services/dataRetentionService.js';
import logger from '../utils/logger.js';

// Controller for ARCO rights implementation
export const getPersonalData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's personal data
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Fetch user's bookings
    const bookings = await Booking.find({ user: userId });

    // Fetch user's clinical history if patient
    let clinicalHistories = [];
    if (user.role === 'paciente' || user.role === 'patient') {
      clinicalHistories = await PsychologicalClinicalHistory.find({ patient: userId })
        .populate('psychologist', 'name email');
    }

    res.status(200).json({
      success: true,
      data: {
        user: user,
        bookings: bookings,
        clinicalHistories: clinicalHistories
      },
      message: 'Datos personales obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error fetching personal data', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo datos personales' 
    });
  }
};

export const updatePersonalData = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate that only allowed fields can be updated
    const allowedUpdates = [
      'name', 'email', 'phone', 'address', 'emergencyContact', 
      'medicalConditions', 'allergies', 'gender', 'birthDate', 'occupation'
    ];
    
    const requestedUpdates = Object.keys(updates);
    const isValidOperation = requestedUpdates.every(update => 
      allowedUpdates.includes(update)
    );
    
    if (!isValidOperation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Actualización no permitida para uno o más campos' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Datos personales actualizados exitosamente'
    });
  } catch (error) {
    logger.error('Error updating personal data', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      success: false, 
      message: 'Error actualizando datos personales' 
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete the user account (mark as deleted instead of removing)
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${user.email || 'user'}` // anonymize email
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Update the retention expiry date for this user
    await dataRetentionService.updateRetentionExpiryOnDeletion(userId);

    // Anonymize related bookings
    await Booking.updateMany(
      { user: userId },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
          patientName: 'Anonymized Patient',
          patientEmail: `anonymized_${Date.now()}@deleted.com`
        }
      }
    );

    // Anonymize clinical histories (soft delete approach)
    await PsychologicalClinicalHistory.updateMany(
      { patient: userId },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Cuenta y datos relacionados eliminados exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting account', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      success: false, 
      message: 'Error eliminando cuenta' 
    });
  }
};

export const getConsents = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('consents preferences');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        consents: user.consents || [],
        preferences: user.preferences || {}
      },
      message: 'Consents obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error fetching consents', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo consents' 
    });
  }
};

export const updateConsents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { consentType, granted } = req.body;

    const validConsentTypes = [
      'marketing', 'analytics', 'dataProcessing', 
      'research', 'thirdPartySharing', 'clinicalCommunication'
    ];

    if (!validConsentTypes.includes(consentType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de consentimiento inválido. Valores válidos: ${validConsentTypes.join(', ')}` 
      });
    }

    if (typeof granted !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo "granted" debe ser booleano' 
      });
    }

    // Update consent preferences
    const updateObj = {};
    updateObj[`preferences.${consentType}`] = granted;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    ).select('consents preferences');

    res.status(200).json({
      success: true,
      data: {
        consentType,
        granted,
        preferences: user.preferences
      },
      message: `Consentimiento ${consentType} actualizado exitosamente`
    });
  } catch (error) {
    logger.error('Error updating consents', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      success: false, 
      message: 'Error actualizando consents' 
    });
  }
};

