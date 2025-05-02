import nodemailer from "nodemailer";

export const sendResetEmail = async (to, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SIGEV" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click this link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
