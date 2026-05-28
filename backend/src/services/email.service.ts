import { transporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async (options: SendMailOptions): Promise<void> => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('Email not sent (SMTP not configured):', options.subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      ...options,
    });
    logger.info(`Email sent: ${options.subject} to ${options.to}`);
  } catch (error) {
    logger.error('Email send failed:', error);
  }
};

// ========================
// HTML Email Templates
// ========================

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ROADSOS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e8e8ee; }
    .container { max-width: 600px; margin: 40px auto; background: #12121a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #ff1e2d 0%, #c40017 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin-top: 4px; font-size: 14px; }
    .body { padding: 40px; }
    .otp-box { background: linear-gradient(135deg, rgba(255,30,45,0.1), rgba(196,0,23,0.05)); border: 1px solid rgba(255,30,45,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 48px; font-weight: 900; letter-spacing: 16px; color: #ff1e2d; font-family: monospace; }
    .otp-expiry { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ff1e2d, #c40017); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
    .footer { padding: 24px 40px; text-align: center; background: rgba(0,0,0,0.2); }
    .footer p { font-size: 12px; color: rgba(255,255,255,0.4); }
    .alert-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #f87171; }
    h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.75); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 ROADSOS</h1>
      <p>Emergency Response Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 ROADSOS. All rights reserved.</p>
      <p style="margin-top:6px;">If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailService = {
  async sendOtpEmail(
    email: string,
    name: string,
    otp: string,
    purpose: string,
  ): Promise<void> {
    const isReset = purpose === 'PASSWORD_RESET';
    const subject = isReset ? 'Reset Your Password — ROADSOS' : 'Verify Your Email — ROADSOS';
    const title = isReset ? 'Reset Your Password' : 'Verify Your Email';
    const desc = isReset
      ? 'You requested a password reset. Use the OTP below to reset your password.'
      : 'Welcome to ROADSOS! Use the OTP below to verify your email address.';

    await sendMail({
      to: email,
      subject,
      html: baseTemplate(`
        <h2>Hi ${name},</h2>
        <p>${desc}</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-expiry">⏱ This OTP expires in 10 minutes</div>
        </div>
        <p style="margin-top:12px;">Enter this code in the app to ${isReset ? 'reset your password' : 'verify your account'}.</p>
        <div class="divider"></div>
        <div class="alert-badge">🔒 Never share this OTP with anyone, including ROADSOS support.</div>
      `),
    });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await sendMail({
      to: email,
      subject: 'Welcome to ROADSOS — Stay Protected! 🚨',
      html: baseTemplate(`
        <h2>Welcome to ROADSOS, ${name}! 🎉</h2>
        <p>Your account is now verified and fully activated. You're part of the ROADSOS emergency response network.</p>
        <div class="divider"></div>
        <h2 style="font-size:16px; margin-bottom:16px;">What you can do now:</h2>
        <p>🚑 <strong>Send SOS alerts</strong> — Get immediate help for medical, police, or road emergencies</p>
        <br/>
        <p>📍 <strong>Share your location</strong> — Let emergency responders find you instantly</p>
        <br/>
        <p>👥 <strong>Emergency Contacts</strong> — Add trusted people to notify in emergencies</p>
        <div class="divider"></div>
        <a class="btn" href="${env.CLIENT_URL}">Open ROADSOS App →</a>
        <p style="margin-top:16px; font-size:13px;">Stay safe, stay prepared. We're always here for you.</p>
      `),
    });
  },

  async sendWelcomeBackEmail(email: string, name: string): Promise<void> {
    await sendMail({
      to: email,
      subject: 'Welcome Back to ROADSOS',
      html: baseTemplate(`
        <h2>Welcome back, ${name}! 👋</h2>
        <p>You've successfully logged in to your ROADSOS account.</p>
        <p style="margin-top:12px;">If this wasn't you, please <a href="${env.CLIENT_URL}/forgot-password" style="color:#ff1e2d;">reset your password immediately</a>.</p>
      `),
    });
  },

  async sendEmergencyNotification(
    email: string,
    name: string,
    sosDetails: {
      emergencyType: string;
      address?: string;
      timestamp: Date;
    },
  ): Promise<void> {
    await sendMail({
      to: email,
      subject: `🚨 EMERGENCY ALERT — ${name} needs help!`,
      html: baseTemplate(`
        <div class="alert-badge">🚨 EMERGENCY ALERT</div>
        <h2>${name} has triggered an SOS!</h2>
        <p>Your emergency contact <strong>${name}</strong> has sent an SOS alert and may need immediate assistance.</p>
        <div class="otp-box" style="text-align:left; padding: 20px;">
          <p><strong>Emergency Type:</strong> ${sosDetails.emergencyType}</p>
          ${sosDetails.address ? `<p style="margin-top:8px;"><strong>Location:</strong> ${sosDetails.address}</p>` : ''}
          <p style="margin-top:8px;"><strong>Time:</strong> ${sosDetails.timestamp.toLocaleString()}</p>
        </div>
        <p style="color:#f87171; font-weight:600; margin-top:16px;">Please contact them immediately or call emergency services (100/108/112).</p>
      `),
    });
  },
};
