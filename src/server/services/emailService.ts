import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendContractorEmail = async (to: string, subject: string, body: string) => {
  // In a real production app, we'd use a real SMTP server.
  // For this sandbox, we'll log it.
  console.log(`Sending email to ${to}...`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  try {
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to,
    //   subject,
    //   text: body,
    // });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
