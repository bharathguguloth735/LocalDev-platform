import logger from './logger.js';

export const sendEmail = async (to, subject, htmlContent) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@localdevconnect.com';
  const SENDER_NAME = 'LocalDev Connect';

  if (!BREVO_API_KEY) {
    logger.warn('BREVO_API_KEY not found. Skipping email send.');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      logger.warn(`[DEVELOPER FALLBACK] Brevo API failed (${response.status}). LOGGING OTP TO LOG FILES:`);
      logger.info(`OTP Content for ${to}: ${subject}`);
      return { message: 'Developer Fallback Active', logged: true };
    }
    logger.info(`[EMAIL] Sent successfully to ${to}`);
    return data;
  } catch (error) {
    logger.error('Error sending email:', error);
    logger.info(`!!! [CRITICAL FALLBACK] OTP CONTENT: ${subject} !!!`);
    return { message: 'Critical Fallback Active', error: true };
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = `Welcome to LocalDev Connect, ${userName}!`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to LocalDev Connect!</h2>
      <p>Hi ${userName},</p>
      <p>Your account has been successfully created. We are excited to have you as part of our community!</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #374151;">Getting Started:</p>
        <ul style="color: #4b5563; padding-left: 20px;">
          <li>Complete your profile to stand out.</li>
          <li>Explore real-world projects from local businesses.</li>
          <li>Collaborate and grow your professional portfolio.</li>
        </ul>
      </div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
        &copy; 2026 LocalDev Connect. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail(userEmail, subject, htmlContent);
};

export const sendOtpEmail = async (userEmail, otp) => {
  const subject = `Your LocalDev Connect Verification Code: ${otp}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🛡️</span>
        <h2 style="color: #4f46e5; margin: 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Verify Your Email</h2>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">Thank you for joining LocalDev Connect. Use the following 6-digit verification code to complete your registration:</p>
      
      <div style="background-color: #f3f4f6; padding: 25px; border-radius: 16px; text-align: center; margin: 25px 0; border: 1px dashed #d1d5db;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #111827; font-family: monospace;">${otp}</span>
      </div>
      
      <p style="color: #ef4444; font-size: 13px; font-weight: 600; text-align: center;">This code will expire in 10 minutes.</p>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">If you did not request this code, you can safely ignore this email.</p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; letter-spacing: 1px;">
        LOCALDEV CONNECT | SECURE DEVELOPER MARKETPLACE
      </p>
    </div>
  `;
  logger.info(`[EMAIL OTP] Initiating send to ${userEmail}`);
  return sendEmail(userEmail, subject, htmlContent);
};

