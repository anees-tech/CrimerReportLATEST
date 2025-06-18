import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "aneesliaqat557@gmail.com",
    pass: process.env.EMAIL_PASS || "xobg yrab vxuh kmiy",
  },
});

export const sendPasswordResetEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Password Reset - Crime Report System",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for the Crime Report System.</p>
          <p>Your OTP code is: <strong style="font-size: 18px; letter-spacing: 2px;">${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};
