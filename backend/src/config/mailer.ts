import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

export const createMailTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const transporter = createMailTransporter();

export const verifyMailConnection = async (): Promise<void> => {
  try {
    if (env.SMTP_USER && env.SMTP_PASS) {
      await transporter.verify();
      logger.info('✅ Mail server connected');
    } else {
      logger.warn('⚠️ SMTP credentials not configured — emails disabled');
    }
  } catch (error) {
    logger.warn('⚠️ Mail server connection failed — emails may not work');
  }
};
