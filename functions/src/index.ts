import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = functions.https.onCall(
  async (data: ContactFormData, context) => {
    const {name, email, phone, subject, message} = data;

    if (!name || !email || !subject || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    const emailConfig = functions.config().email;
    
    if (!emailConfig || !emailConfig.user || !emailConfig.pass) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Email service not configured"
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    const mailOptions = {
      from: emailConfig.user,
      to: emailConfig.recipient || emailConfig.user,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>This message was sent from your website contact form.</em></p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {success: true, message: "Email sent successfully"};
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send email"
      );
    }
  }
);
