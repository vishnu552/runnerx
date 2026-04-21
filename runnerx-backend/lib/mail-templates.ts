/**
 * Email templates for RunnerX
 */

const baseStyle = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8faff;
`;

const containerStyle = `
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f7;
`;

const headerStyle = `
  background: linear-gradient(135deg, #00a0ff 0%, #0077ff 100%);
  padding: 40px;
  text-align: center;
`;

const bodyStyle = `
  padding: 40px;
`;

const buttonStyle = `
  display: inline-block;
  padding: 14px 32px;
  background-color: #00a0ff;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(0, 160, 255, 0.3);
`;

const footerStyle = `
  padding: 30px;
  text-align: center;
  font-size: 13px;
  color: #8898aa;
  background-color: #fcfdfe;
`;

const brandText = `<h1 style="margin:0; color:#ffffff; font-size: 28px; letter-spacing: 2px;">RUNNER<span style="color:#ffdc50">X</span></h1>`;

/**
 * Verification Email Template
 */
export const verificationTemplate = (userName: string, verificationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email - RunnerX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faff;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        ${brandText}
      </div>
      <div style="${bodyStyle}">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px;">Welcome to the Fast Lane, ${userName}!</h2>
        <p>You're almost there! We're excited to have you join our community of runners. To get started and secure your account, please verify your email address by clicking the button below.</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" style="${buttonStyle}">Verify Email Address</a>
        </div>
        <p style="margin-top: 32px; font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #00a0ff; word-break: break-all;">${verificationUrl}</p>
        <p style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">Stay active,<br><strong>Team RunnerX</strong></p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} RunnerX. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Forgot Password Template
 */
export const forgotPasswordTemplate = (userName: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - RunnerX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faff;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        ${brandText}
      </div>
      <div style="${bodyStyle}">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px;">Password Reset Requested</h2>
        <p>Hello ${userName}, we received a request to reset your password. No worries, it happens to the best of us!</p>
        <p>Click the button below to set a new password. This link will expire in 1 hour for your security.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
        </div>
        <p style="margin-top: 32px; font-size: 14px; color: #666;">If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">Keep running,<br><strong>Team RunnerX</strong></p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} RunnerX. All rights reserved.</p>
        <p>RunnerX Headquarters | Marathon Way, Sports City</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Event Registration Success Template
 */
export const eventRegistrationTemplate = (userName: string, eventName: string, registrationId: string, eventDate: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Registration Confirmed - ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faff;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        ${brandText}
      </div>
      <div style="${bodyStyle}">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 50px;">🏁</span>
        </div>
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px; text-align: center;">You're Registered!</h2>
        <p>Hi ${userName},</p>
        <p>Congratulations! You have successfully registered for <strong>${eventName}</strong>. We can't wait to see you at the starting line.</p>
        
        <div style="background-color: #f8faff; border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px dashed #00a0ff;">
          <h3 style="margin-top: 0; color: #00a0ff; font-size: 18px;">Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 120px;">Registration ID:</td>
              <td style="padding: 8px 0; font-weight: 600;">#${registrationId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Event:</td>
              <td style="padding: 8px 0; font-weight: 600;">${eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Date:</td>
              <td style="padding: 8px 0; font-weight: 600;">${eventDate}</td>
            </tr>
          </table>
        </div>

        <p>What's next? Start training, stay hydrated, and keep an eye on your inbox for more details as race day approaches.</p>
        
        <div style="text-align: center;">
          <a href="#" style="${buttonStyle}">View Dashboard</a>
        </div>
        
        <p style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">See you at the race,<br><strong>Team RunnerX</strong></p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} RunnerX. All rights reserved.</p>
        <p>Get Ready. Get Set. RunnerX.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
