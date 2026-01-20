import transporter from "../config/mailer.js";

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.BREVO_FROM_EMAIL,
    to,
    subject,
    html,
  });
};
