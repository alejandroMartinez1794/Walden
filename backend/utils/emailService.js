/**
 * Brevo Email Service (formerly Sendinblue)
 * 
 * Student Pack: 300 emails/día GRATIS PERMANENTE
 * Mejor deliverability que SMTP directo
 * Docs: https://developers.brevo.com/docs
 */

import * as brevo from '@getbrevo/brevo';
import logger from './logger.js';

/**
 * Send email via Brevo API
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.html - HTML message (optional)
 * @returns {Promise<Object>} Brevo response
 */
const sendEmail = async (options) => {
  // En modo test, mock sin conexión real
  if (process.env.NODE_ENV === 'test') {
    logger.info('📧 [TEST MODE] Email would be sent:', {
      to: options.email,
      subject: options.subject
    });
    return Promise.resolve({
      messageId: 'test-message-id',
      accepted: [options.email],
    });
  }

  // Validar que exista API key
  if (!process.env.BREVO_API_KEY) {
    logger.error('❌ BREVO_API_KEY not configured');
    throw new Error('Email service not configured. Contact system administrator.');
  }

  try {
    // 1) Configure Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // 2) Prepare email data
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.sender = {
      name: 'basileias',
      email: process.env.EMAIL_FROM || 'noreply@basileias.app',
    };
    sendSmtpEmail.to = [
      {
        email: options.email,
        name: options.name || options.email.split('@')[0], // Use name if provided
      },
    ];
    
    // BCC para administración (opcional)
    if (process.env.EMAIL_BCC) {
      sendSmtpEmail.bcc = [
        {
          email: process.env.EMAIL_BCC,
          name: 'Admin basileias',
        },
      ];
    }
    
    // 3) Set email content (HTML takes precedence)
    if (options.html) {
      sendSmtpEmail.htmlContent = options.html;
    } else if (options.message) {
      sendSmtpEmail.textContent = options.message;
    } else {
      throw new Error('Email must have either html or message content');
    }

    // 4) Send email via Brevo
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    logger.info(`✅ Email sent to ${options.email} (ID: ${response.messageId})`);
    
    return {
      messageId: response.messageId,
      accepted: [options.email],
    };
    
  } catch (error) {
    logger.error('❌ Brevo email error:', error.message);
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('Full error:', error);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create Brevo account:
 *    - Go to: https://app.brevo.com/account/register
 *    - Verify email
 *    - Free plan: 300 emails/day PERMANENTE
 * 
 * 2. Get API key:
 *    - Settings → SMTP & API → API Keys
 *    - Create new key with permissions: Send transactional emails
 *    - Copy the key (starts with xkeysib-)
 * 
 * 3. Add to .env:
 *    BREVO_API_KEY=xkeysib-your_key_here
 *    EMAIL_FROM=noreply@basileias.app
 *    EMAIL_BCC=admin@basileias.app (optional)
 * 
 * 4. Verify sender email:
 *    - Senders & IP → Add a Sender
 *    - Use your domain email (e.g., noreply@basileias.app)
 *    - Verify via email confirmation
 * 
 * 5. Advantages over SMTP:
 *    ✅ Better deliverability (dedicated IPs)
 *    ✅ No ECONNREFUSED errors
 *    ✅ Email analytics dashboard
 *    ✅ Built-in spam protection
 *    ✅ Template management (optional)
 *    ✅ 300 emails/day free FOREVER
 * 
 * 6. Usage examples:
 *    - Registration: sendEmail({ email: 'user@example.com', subject: 'Welcome', html: '<h1>Welcome!</h1>' })
 *    - Booking: sendEmail({ email: 'patient@example.com', subject: 'Appointment Confirmed', message: 'Your appointment...' })
 *    - Security: sendEmail({ email: 'user@example.com', subject: 'Security Alert', html: '<p>We detected...</p>' })
 * 
 * 7. Monitor usage:
 *    - Dashboard shows: sent, delivered, opened, clicked, bounced
 *    - Alerts when approaching daily limit
 */
