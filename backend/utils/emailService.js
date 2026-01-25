import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // En modo test, usar transporter de prueba sin conexión real
  if (process.env.NODE_ENV === 'test') {
    console.log('📧 [TEST MODE] Email would be sent:', {
      to: options.email,
      subject: options.subject
    });
    // Retornar sin intentar enviar
    return Promise.resolve({
      accepted: [options.email],
      messageId: 'test-message-id'
    });
  }

  // 1) Create a transporter
  // Support for predefined services (Gmail, Outlook) or custom SMTP
  const transportConfig = process.env.EMAIL_SERVICE
    ? {
        service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'hotmail'
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      }
    : {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  // 2) Define the email options
  const mailOptions = {
    from: `Psiconepsis <${process.env.EMAIL_FROM}>`,
    to: options.email,
    bcc: 'psiconepsis@gmail.com', // Copia oculta para administración
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  return await transporter.sendMail(mailOptions);
};

export default sendEmail;
