const nodemailer = require("nodemailer");

/* -----------------------------
   TRANSPORTER CONFIG
----------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -----------------------------
   SEND EMAIL FUNCTION
----------------------------- */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

module.exports = {
  sendEmail,
};