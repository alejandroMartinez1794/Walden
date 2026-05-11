import express from 'express';
import { getPersonalData, updatePersonalData, deleteAccount, getConsents, updateConsents } from '../Controllers/arcoController.js';
import { authenticate as verifyToken } from '../auth/verifyToken.js';

const router = express.Router();

// ARCO Rights Routes - Access, Rectification, Cancellation, Opposition
router.get('/me', verifyToken, getPersonalData);                    // Access to personal data
router.put('/me', verifyToken, updatePersonalData);                 // Rectification of personal data
router.delete('/me', verifyToken, deleteAccount);                   // Cancellation of account/data
router.get('/me/consents', verifyToken, getConsents);               // Opposition to data processing
router.put('/me/consents', verifyToken, updateConsents);            // Updating consent preferences

// Additional consent management routes
router.post('/consent', verifyToken, updateConsents);               // Consent recording
router.get('/consent/history', verifyToken, getConsents);           // Consent history

export default router;
