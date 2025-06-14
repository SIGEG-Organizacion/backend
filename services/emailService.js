import nodemailer from "nodemailer";

export const sendResetEmail = async (to, resetUrl) => {
  const subject = "Password Reset Request";
  const html = `
      <p>You requested a password reset.</p>
      <p>Click this link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;
  //aqui va la logica corregida para enviar el correo
  await sendMail(to, subject, html);
};

export const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_SECRET,
      },
    });

    const mailOptions = {
      from: `SIGEV <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log("Error " + err);
      } else {
        console.log("Email sent successfully");
      }
    });
  } catch (err) {
    console.error("[MAIL ERROR]", err);
    throw err;
  }
};
