import nodemailer from 'nodemailer';
import env from './env.js';

let transporter = null;

export const getEmailTransporter = async () => {
  if (transporter) return transporter;

  if (env.NODE_ENV === 'test') {
    // Use test account for automated tests
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  } else if (env.EMAIL_HOST === 'ethereal') {
    // Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Production SMTP
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = await getEmailTransporter();
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || '"SUNNYS Pizza" <noreply@sunnyspizza.com>',
      to: email,
      subject: 'Verify Your Email - SUNNYS Pizza',
      html: `
        <h2>Welcome to SUNNYS Pizza!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    });

    if (env.NODE_ENV === 'development' && env.EMAIL_HOST === 'ethereal') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    if (env.NODE_ENV === 'test') {
      // In test mode, suppress email errors
      return { messageId: 'test-message-id' };
    }
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const transporter = await getEmailTransporter();
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || '"SUNNYS Pizza" <noreply@sunnyspizza.com>',
      to: email,
      subject: 'Reset Your Password - SUNNYS Pizza',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    if (env.NODE_ENV === 'development' && env.EMAIL_HOST === 'ethereal') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    if (env.NODE_ENV === 'test') {
      // In test mode, suppress email errors
      return { messageId: 'test-message-id' };
    }
    throw error;
  }
};
