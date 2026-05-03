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
 * Sent to the primary registrant after payment.
 */
export const eventRegistrationTemplate = (
  userName: string,
  eventName: string,
  registrationId: string,
  eventDate: string
) => `
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
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px; text-align: center;">Registration Confirmed</h2>
        <p>Hi ${userName},</p>
        <p>Congratulations! You have successfully registered for <strong>${eventName}</strong>. We can't wait to see you at the starting line.</p>
        
        <div style="background-color: #f8faff; border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px dashed #00a0ff;">
          <h3 style="margin-top: 0; color: #00a0ff; font-size: 18px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px;">Order ID:</td>
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

        <p>Check your email for individual registration IDs for each participant. Start training, stay hydrated, and keep an eye on your inbox for more details as race day approaches.</p>
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

/**
 * Participant Confirmation Template
 * Sent to each participant who already has a RunnerX account.
 */
export const participantConfirmationTemplate = (
  participantName: string,
  eventName: string,
  uniqueRegId: string,
  eventDate: string,
  categoryName: string,
  amount: string | number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You're Registered - ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faff;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        ${brandText}
      </div>
      <div style="${bodyStyle}">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px; text-align: center;">Registration Confirmed</h2>
        <p>Hi ${participantName},</p>
        <p>Great news — you've been successfully registered for <strong>${eventName}</strong>! Your spot is confirmed.</p>
        <p>This registration was completed as part of a group/multi-participant entry.</p>

        <div style="background-color: #f8faff; border-radius: 12px; padding: 24px; margin: 30px 0; border: 2px solid #00a0ff;">
          <h3 style="margin-top: 0; color: #00a0ff; font-size: 18px; text-align: center;">Your Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; width: 160px;">Registration ID:</td>
              <td style="padding: 10px 0; font-weight: 800; font-size: 18px; color: #00a0ff; letter-spacing: 1px;">${uniqueRegId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Category:</td>
              <td style="padding: 10px 0; font-weight: 600;">${categoryName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Amount Paid:</td>
              <td style="padding: 10px 0; font-weight: 600;">₹${amount || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Event:</td>
              <td style="padding: 10px 0; font-weight: 600;">${eventName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Date:</td>
              <td style="padding: 10px 0; font-weight: 600;">${eventDate}</td>
            </tr>
          </table>
        </div>

        <p>Keep this email safe — your Registration ID <strong>${uniqueRegId}</strong> is your entry pass for race day.</p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || '#'}/dashboard/registrations" style="${buttonStyle}">View My Registration</a>
        </div>
        <p style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">See you at the finish line,<br><strong>Team RunnerX</strong></p>
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

/**
 * New Participant Welcome + Credentials Template
 * Sent to participants who did NOT have a RunnerX account.
 * Includes their auto-created credentials (DOB as password).
 */
export const newParticipantWelcomeTemplate = (
  participantName: string,
  eventName: string,
  uniqueRegId: string,
  eventDate: string,
  email: string,
  password: string,
  categoryName: string,
  amount: string | number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to RunnerX - You're Registered for ${eventName}!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faff;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        ${brandText}
      </div>
      <div style="${bodyStyle}">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 24px; text-align: center;">Welcome to RunnerX</h2>
        <p>Hi ${participantName},</p>
        <p>You've been registered for <strong>${eventName}</strong> by a fellow runner. We're excited to have you join us!</p>

        <div style="background-color: #f8faff; border-radius: 12px; padding: 24px; margin: 30px 0; border: 2px solid #00a0ff;">
          <h3 style="margin-top: 0; color: #00a0ff; font-size: 18px; text-align: center;">Your Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; width: 160px;">Registration ID:</td>
              <td style="padding: 10px 0; font-weight: 800; font-size: 18px; color: #00a0ff; letter-spacing: 1px;">${uniqueRegId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Category:</td>
              <td style="padding: 10px 0; font-weight: 600;">${categoryName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Amount Paid:</td>
              <td style="padding: 10px 0; font-weight: 600;">₹${amount || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Event:</td>
              <td style="padding: 10px 0; font-weight: 600;">${eventName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Date:</td>
              <td style="padding: 10px 0; font-weight: 600;">${eventDate}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff8e6; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #ffc83c;">
          <h3 style="margin-top: 0; color: #b8860b; font-size: 16px;">🔑 Your New RunnerX Account</h3>
          <p style="margin: 8px 0; color: #666;">We've created a RunnerX account for you so you can track your registration and manage your details.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 14px; background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0 0; color: #666; font-weight: 600; vertical-align: top; padding-top: 12px;">Password:</td>
              <td style="padding-top: 12px;">
                <span style="font-family: monospace; font-size: 16px; font-weight: 800; background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; letter-spacing: 2px;">${password}</span>
                <p style="margin: 6px 0 0; font-size: 12px; color: #999;">(Your date of birth in YYYYMMDD format)</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff0f0; border-radius: 8px; padding: 16px; border-left: 4px solid #e74c3c; margin: 16px 0;">
          <p style="margin: 0; color: #c0392b; font-weight: 600;">⚠️ Important: Please login and change your password immediately for security.</p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || '#'}/auth/login" style="${buttonStyle}">Login to RunnerX</a>
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

