import dotenv from "dotenv";
import nodemailer from "nodemailer";

// 🔥 IMPORTANT: load env BEFORE using process.env
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
