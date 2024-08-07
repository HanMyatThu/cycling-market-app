import nodemailer from "nodemailer";
import "dotenv/config";

export const SendEmail = async (to: string, from: string, html: string) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  await transport.sendMail({
    from,
    to,
    html,
  });
};
