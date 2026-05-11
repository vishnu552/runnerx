import nodemailer from "nodemailer";
import {
  verificationTemplate,
  forgotPasswordTemplate,
  eventRegistrationTemplate,
  participantConfirmationTemplate,
  newParticipantWelcomeTemplate,
} from "./mail-templates";

/**
 * Configure Nodemailer transport
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailFrom = process.env.MAIL_FROM || '"RunnerX" <noreply@runnerx.in>';

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  token: string,
) {
  const verificationUrl = `${process.env.DASHBOARD_URL}/verify?token=${token}`;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: "Verify your RunnerX account",
    html: verificationTemplate(userName, verificationUrl),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

/**
 * Send forgot password email
 */
export async function sendForgotPasswordEmail(
  email: string,
  userName: string,
  token: string,
) {
  const resetUrl = `${process.env.DASHBOARD_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: "Reset your RunnerX password",
    html: forgotPasswordTemplate(userName, resetUrl),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Forgot password email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending forgot password email:", error);
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
  eventDate: string,
) {
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Registration Confirmed: ${eventName}`,
    html: eventRegistrationTemplate(
      userName,
      eventName,
      registrationId,
      eventDate,
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Registration success email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending registration success email:", error);
    throw error;
  }
}

/**
 * Send confirmation email to a participant who already has a RunnerX account.
 */
export async function sendParticipantConfirmationEmail(
  email: string,
  participantName: string,
  eventName: string,
  uniqueRegId: string,
  eventDate: string,
  categoryName: string,
  amount: string | number,
) {
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `You're registered for ${eventName}! — ${uniqueRegId}`,
    html: participantConfirmationTemplate(
      participantName,
      eventName,
      uniqueRegId,
      eventDate,
      categoryName,
      amount,
    ),
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Participant confirmation email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending participant confirmation email:", error);
    throw error;
  }
}

/**
 * Send welcome + credentials email to a new participant (auto-created account).
 * Password is their DOB in yyyymmdd format, sent in plain text.
 */
export async function sendNewParticipantWelcomeEmail(
  email: string,
  participantName: string,
  password: string,
  eventName: string,
  uniqueRegId: string,
  eventDate: string,
  categoryName: string,
  amount: string | number,
) {
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Welcome to RunnerX — You're registered for ${eventName}!`,
    html: newParticipantWelcomeTemplate(
      participantName,
      eventName,
      uniqueRegId,
      eventDate,
      email,
      password,
      categoryName,
      amount,
    ),
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("New participant welcome email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending new participant welcome email:", error);
    throw error;
  }
}

/**
 * Send contact inquiry notification to admin
 */
export async function sendContactInquiryEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  siteFor: string = "GLOBAL",
) {
  const mailOptions = {
    from: mailFrom,
    to: "contact@runnerx.in",
    subject: `New Contact Inquiry [${siteFor}]: ${subject || "No Subject"}`,
    html: `
      <h2>New Message from Contact Form</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Site:</strong> ${siteFor}</p>
      <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <div style="padding: 15px; background: #f4f4f4; border-radius: 8px;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Contact inquiry email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending contact inquiry email:", error);
    throw error;
  }
}

export default transporter;
