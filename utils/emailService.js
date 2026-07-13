// utils/emailService.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, type = 'password_reset') => {
  try {
    const transporter = createTransporter();
    
    const subject = type === 'password_reset' 
      ? '🔐 Password Reset OTP - Assure Organic Zone' 
      : '📧 Email Verification OTP - Assure Organic Zone';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .content {
            padding: 30px 25px;
            text-align: center;
          }
          .content h2 {
            color: #1a1a2e;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .content p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin: 8px 0;
          }
          .otp-box {
            background: #f8f9fc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border: 2px dashed #e5e7eb;
          }
          .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .expiry-text {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 10px;
          }
          .footer {
            background: #f8fafc;
            padding: 15px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
          }
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Assure Organic Zone</h1>
          </div>
          <div class="content">
            <h2>${type === 'password_reset' ? '🔐 Password Reset Request' : '📧 Email Verification'}</h2>
            <p>Hello,</p>
            <p>${type === 'password_reset' 
              ? 'We received a request to reset your password. Use the OTP below to proceed.' 
              : 'Please verify your email address using the OTP below.'}
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 13px; color: #6b7280;">
              This OTP is valid for <strong>10 minutes</strong>.
            </p>
            <p style="font-size: 13px; color: #6b7280;">
              If you didn't request this, please ignore this email.
            </p>
            <div class="divider"></div>
            <p style="font-size: 12px; color: #9ca3af;">
              For security, do not share this OTP with anyone.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Assure Organic Zone. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Assure Organic Zone" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send Password Reset Success Email
const sendPasswordResetSuccessEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .content {
            padding: 30px 25px;
            text-align: center;
          }
          .content h2 {
            color: #1a1a2e;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .content p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin: 8px 0;
          }
          .success-icon {
            font-size: 48px;
            margin: 10px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 15px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maisfood</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Password Reset Successful</h2>
            <p>Hello ${name || 'User'},</p>
            <p>Your password has been successfully reset.</p>
            <p style="color: #059669; font-weight: 600;">
              You can now login with your new password.
            </p>
            <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
              If you didn't perform this action, please contact support immediately.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Assure Organic Zone. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Assure Organic Zone" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Password Reset Successful - Assure Organic Zone',
      html: html,
    });

    console.log(`✅ Password reset success email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetSuccessEmail
};