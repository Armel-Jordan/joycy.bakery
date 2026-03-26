import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");
const EMAIL_RECIPIENT = defineSecret("EMAIL_RECIPIENT");

function createTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = functions.onCall(
  { secrets: [EMAIL_USER, EMAIL_PASS, EMAIL_RECIPIENT] },
  async (request) => {
    const data = request.data as ContactFormData;
    const { name, email, phone, subject, message } = data;

    if (!name || !email || !subject || !message) {
      throw new functions.HttpsError("invalid-argument", "Champs manquants");
    }

    const user = EMAIL_USER.value();
    const pass = EMAIL_PASS.value();
    const recipient = EMAIL_RECIPIENT.value() || user;

    if (!user || !pass) {
      throw new functions.HttpsError("failed-precondition", "Email non configuré");
    }

    const transporter = createTransporter(user, pass);

    await transporter.sendMail({
      from: user,
      to: recipient,
      replyTo: email,
      subject: `Contact: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone || "Non fourni"}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <h3>Message :</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return { success: true };
  }
);

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: OrderItem[];
  total: number;
  deliveryMode: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  paymentMethod: string;
  notes?: string;
}

export const sendOrderConfirmationEmail = functions.onCall(
  { secrets: [EMAIL_USER, EMAIL_PASS, EMAIL_RECIPIENT] },
  async (request) => {
    const data = request.data as OrderConfirmationData;

    const user = EMAIL_USER.value();
    const pass = EMAIL_PASS.value();
    const recipient = EMAIL_RECIPIENT.value() || user;

    if (!user || !pass) {
      throw new functions.HttpsError("failed-precondition", "Email non configuré");
    }

    if (!data.clientEmail) return { success: true, skipped: true };

    const transporter = createTransporter(user, pass);

    const itemsHtml = data.items.map((item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0e8e0;">${item.productName}</td>
        <td style="padding:8px;border-bottom:1px solid #f0e8e0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f0e8e0;text-align:right;">${item.price.toFixed(2)} $</td>
      </tr>`).join("");

    const deliveryLine = data.deliveryMode === "home"
      ? `Livraison à domicile — ${data.deliveryAddress}`
      : "Ramassage gratuit (Pick-up) — Québec City";

    const paymentLabel = data.paymentMethod === "interac" ? "Virement Interac" : "Espèces";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2c2c2c;">
        <div style="background:#6E260E;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:1.5rem;">🍪 Joycy Bakery</h1>
          <p style="color:#f5e6d0;margin:6px 0 0;">Confirmation de commande</p>
        </div>
        <div style="background:#fff;padding:28px;border:1px solid #f0e0d0;border-top:none;">
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          <p>Merci pour votre commande ! Nous vous contacterons très bientôt pour confirmer les détails.</p>

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:8px;">📦 Votre commande</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f5ede4;">
                <th style="padding:8px;text-align:left;">Produit</th>
                <th style="padding:8px;text-align:center;">Qté</th>
                <th style="padding:8px;text-align:right;">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-top:12px;font-size:1.1rem;">
            <strong style="color:#6E260E;">Total : ${data.total.toFixed(2)} $</strong>
          </div>

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:8px;margin-top:24px;">🚗 Livraison</h3>
          <p>${deliveryLine}</p>
          ${data.deliveryDate ? `<p>📅 Date souhaitée : <strong>${data.deliveryDate}</strong></p>` : ""}

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:8px;margin-top:24px;">💳 Paiement</h3>
          <p>${paymentLabel}</p>

          ${data.notes ? `<h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:8px;margin-top:24px;">📝 Notes</h3><p>${data.notes}</p>` : ""}

          <div style="background:#f5ede4;padding:16px;border-radius:8px;margin-top:24px;text-align:center;">
            <p style="margin:0;color:#6E260E;">Des questions ? Contactez-nous par téléphone ou WhatsApp.</p>
          </div>
        </div>
        <div style="background:#f9f0e8;padding:16px;text-align:center;border-radius:0 0 12px 12px;font-size:0.85rem;color:#999;">
          Joycy Bakery — Québec City
        </div>
      </div>`;

    // Email au client
    await transporter.sendMail({
      from: `"Joycy Bakery" <${user}>`,
      to: data.clientEmail,
      subject: "✅ Confirmation de votre commande — Joycy Bakery",
      html,
    });

    // Notification à l'admin
    await transporter.sendMail({
      from: user,
      to: recipient,
      subject: `🆕 Nouvelle commande — ${data.clientName} (${data.total.toFixed(2)} $)`,
      html: `<p><strong>Client :</strong> ${data.clientName} — ${data.clientPhone} — ${data.clientEmail}</p>${html}`,
    });

    return { success: true };
  }
);
