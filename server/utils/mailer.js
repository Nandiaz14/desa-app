const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(toEmail, otp, nama) {
  await transporter.sendMail({
    from: `"Sistem Informasi Desa Cikulak" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Kode Verifikasi Akun Desa Cikulak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1B5EA0; margin: 0;">🏛 Desa Cikulak</h2>
          <p style="color: #718096; font-size: 13px;">Sistem Informasi Desa</p>
        </div>
        <p style="color: #1A2332;">Halo <strong>${nama}</strong>,</p>
        <p style="color: #4A5568; font-size: 14px;">Gunakan kode verifikasi berikut untuk mengaktifkan akun Anda:</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background: #EBF3FC; border: 2px dashed #1B5EA0; border-radius: 12px; padding: 16px 32px;">
            <span style="font-size: 36px; font-weight: 800; color: #1B5EA0; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        <p style="color: #718096; font-size: 13px;">⏱ Kode berlaku selama <strong>10 menit</strong>.</p>
        <p style="color: #718096; font-size: 13px;">Jika Anda tidak mendaftar, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
        <p style="color: #A0AEC0; font-size: 11px; text-align: center;">© 2026 Sistem Informasi Desa Cikulak, Kec. Waled, Kab. Cirebon</p>
      </div>
    `,
  });
}

module.exports = { sendOTPEmail };