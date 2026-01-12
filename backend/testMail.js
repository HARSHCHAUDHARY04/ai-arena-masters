import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

await transporter.sendMail({
  from: `"Test Mail" <${process.env.MAIL_USER}>`,
  to: "abhishekcsed56@gmail.com",
  subject: "Nodemailer Test",
  text: "If you received this, email is working 🎉"
});

console.log("MAIL SENT SUCCESSFULLY");
