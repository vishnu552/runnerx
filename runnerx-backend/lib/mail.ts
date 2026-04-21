import nodemailer from 'nodemailer';
import { 
  verificationTemplate, 
  forgotPasswordTemplate, 
  eventRegistrationTemplate 
} from './mail-templates';

/**
 * Configure Nodemailer transport
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailFrom = process.env.MAIL_FROM || '"RunnerX" <support@runnerx.com>';

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, userName: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: 'Verify your RunnerX account',
    html: verificationTemplate(userName, verificationUrl),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Send forgot password email
 */
export async function sendForgotPasswordEmail(email: string, userName: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: 'Reset your RunnerX password',
    html: forgotPasswordTemplate(userName, resetUrl),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending forgot password email:', error);
    throw error;
  }
}

/**
 * Send event registration success email
 */
export async function sendRegistrationSuccessEmail(
  email: string, 
  userName: string, 
  eventName: string, 
  registrationId: string, 
  eventDate: string
) {
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Registration Confirmed: ${eventName}`,
    html: eventRegistrationTemplate(userName, eventName, registrationId, eventDate),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration success email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending registration success email:', error);
    throw error;
  }
}

export default transporter;
