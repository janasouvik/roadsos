import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #0F0F0F; }
    .container { max-width: 560px; margin: 40px auto; background: #1A1A1A; border-radius: 16px; overflow: hidden; border: 1px solid #2D2D2D; }
    .header { background: linear-gradient(135deg, #B91C1C, #7F1D1D); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px; }
    .header p { color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #D1D5DB; }
    .otp-box { background: #0F0F0F; border: 2px solid #EF4444; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
    .otp { font-size: 42px; font-weight: 900; color: #EF4444; letter-spacing: 12px; }
    .otp-label { color: #6B7280; font-size: 12px; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
    .btn { display: inline-block; background: #EF4444; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; margin: 16px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #2D2D2D; text-align: center; color: #4B5563; font-size: 12px; }
    .warning { background: #1F0A0A; border: 1px solid #7F1D1D; border-radius: 8px; padding: 12px 16px; margin-top: 16px; color: #FCA5A5; font-size: 13px; }
    h2 { color: white; font-size: 20px; margin: 0 0 12px; }
    p { line-height: 1.6; margin: 0 0 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ ROAD GUARDIAN</h1>
      <p>AI Emergency Response Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © 2024 Road Guardian. Protecting Every Journey.<br>
      This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>
`;

export const sendOtpEmail = async (email: string, otp: string, name: string): Promise<void> => {
  const content = `
    <h2>Verify Your Email</h2>
    <p>Hello ${name},</p>
    <p>Your Road Guardian verification code is:</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
      <div class="otp-label">Expires in 10 minutes</div>
    </div>
    <p>Enter this code to verify your account. If you didn't request this, please ignore this email.</p>
    <div class="warning">⚠️ Never share your OTP with anyone. Road Guardian will never ask for it.</div>
  `;

  await send(email, 'Verify Your Email — Road Guardian', content);
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const content = `
    <h2>Welcome to Road Guardian! 🛡️</h2>
    <p>Hello ${name},</p>
    <p>Your account is verified and ready. You're now protected by Road Guardian AI — the most advanced emergency response platform.</p>
    <p><strong>What you can do now:</strong></p>
    <ul style="color: #9CA3AF; padding-left: 20px; line-height: 2;">
      <li>Trigger SOS alerts with one tap</li>
      <li>Get AI emergency guidance 24/7</li>
      <li>Report road accidents instantly</li>
      <li>Find nearest hospitals & police</li>
      <li>Add emergency contacts</li>
    </ul>
    <a href="${env.CLIENT_URL}" class="btn">Open Road Guardian</a>
    <div class="warning">🚨 In any emergency, always call 112 first.</div>
  `;

  await send(email, 'Welcome to Road Guardian — You\'re Protected!', content);
};

export const sendPasswordResetEmail = async (email: string, otp: string, name: string): Promise<void> => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${name},</p>
    <p>Use this OTP to reset your password:</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
      <div class="otp-label">Expires in 10 minutes</div>
    </div>
    <p>If you didn't request a password reset, your account may be at risk. Please contact support immediately.</p>
    <div class="warning">⚠️ Never share this code. If you didn't request this, please secure your account.</div>
  `;

  await send(email, 'Password Reset Code — Road Guardian', content);
};

export const sendEmergencyContactNotification = async (
  email: string,
  contactName: string,
  userName: string,
  location: string,
  emergencyType: string
): Promise<void> => {
  const content = `
    <h2>🚨 Emergency Alert</h2>
    <p>Hello ${contactName},</p>
    <p><strong>${userName}</strong> has triggered an emergency SOS and listed you as an emergency contact.</p>
    <div class="otp-box" style="border-color: #F97316;">
      <div style="font-size: 18px; color: #F97316; font-weight: 800;">${emergencyType} EMERGENCY</div>
      <div style="color: #9CA3AF; margin-top: 8px; font-size: 14px;">📍 ${location}</div>
    </div>
    <p>Please try to contact them immediately or call emergency services (112).</p>
    <div class="warning">🚨 This is a real emergency alert. Please respond immediately.</div>
  `;

  await send(email, `🚨 EMERGENCY: ${userName} needs help! — Road Guardian`, content);
};

const send = async (to: string, subject: string, htmlContent: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html: emailWrapper(htmlContent),
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Email failed to ${to}:`, error);
    // Don't throw — email failure shouldn't break the request
  }
};
