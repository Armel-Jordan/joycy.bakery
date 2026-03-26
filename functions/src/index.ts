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

    const subjectLabels: Record<string, string> = {
      commande: "🎂 Commande personnalisée",
      info: "ℹ️ Demande d'information",
      feedback: "💬 Commentaire / Suggestion",
      autre: "📩 Autre demande",
    };

    const subjectLabel = subjectLabels[subject] || subject;

    const subjectColors: Record<string, string> = {
      commande: "#6E260E",
      info: "#1a6fb5",
      feedback: "#2e7d32",
      autre: "#555",
    };
    const headerColor = subjectColors[subject] || "#6E260E";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2c2c2c;">
        <div style="background:${headerColor};padding:20px 24px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;">Nouveau message — ${subjectLabel}</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e0e0e0;border-top:none;">
          <div style="background:#f9f9f9;border-left:4px solid ${headerColor};padding:14px 16px;border-radius:4px;margin-bottom:20px;">
            <p style="margin:4px 0;"><strong>Nom :</strong> ${name}</p>
            <p style="margin:4px 0;"><strong>Email :</strong> <a href="mailto:${email}" style="color:${headerColor};">${email}</a></p>
            <p style="margin:4px 0;"><strong>Téléphone :</strong> ${phone || "Non fourni"}</p>
          </div>
          <h3 style="color:${headerColor};border-bottom:2px solid #f0f0f0;padding-bottom:6px;">Message</h3>
          <p style="line-height:1.6;">${message.replace(/\n/g, "<br>")}</p>
        </div>
        <div style="background:#f5f5f5;padding:12px;text-align:center;border-radius:0 0 12px 12px;font-size:0.82rem;color:#999;">
          Joycy Bakery — Formulaire de contact
        </div>
      </div>`;

    await transporter.sendMail({
      from: `"Joycy Bakery Contact" <${user}>`,
      to: recipient,
      replyTo: email,
      subject: `[${subjectLabel}] ${name}`,
      html,
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
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2c2c2c;">
        <div style="background:#6E260E;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;">🆕 Nouvelle commande reçue</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #f0e0d0;border-top:none;">

          <div style="background:#fff8f2;border:1px solid #f0d8c0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;color:#6E260E;">👤 Client</h3>
            <p style="margin:4px 0;"><strong>Nom :</strong> ${data.clientName}</p>
            <p style="margin:4px 0;"><strong>Téléphone :</strong> ${data.clientPhone}</p>
            <p style="margin:4px 0;"><strong>Email :</strong> ${data.clientEmail}</p>
          </div>

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;">📦 Commande</h3>
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
          <div style="text-align:right;margin-top:10px;font-size:1.1rem;">
            <strong style="color:#6E260E;">Total : ${data.total.toFixed(2)} $</strong>
          </div>

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;margin-top:20px;">🚗 Livraison</h3>
          <p style="margin:4px 0;">${deliveryLine}</p>
          ${data.deliveryDate ? `<p style="margin:4px 0;">📅 Date souhaitée : <strong>${data.deliveryDate}</strong></p>` : ""}

          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;margin-top:20px;">💳 Paiement</h3>
          <p style="margin:4px 0;">${paymentLabel}</p>

          ${data.notes ? `<h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;margin-top:20px;">📝 Notes du client</h3><p style="margin:4px 0;">${data.notes}</p>` : ""}
        </div>
        <div style="background:#f9f0e8;padding:12px;text-align:center;border-radius:0 0 12px 12px;font-size:0.85rem;color:#999;">
          Joycy Bakery — Québec City
        </div>
      </div>`;

    await transporter.sendMail({
      from: user,
      to: recipient,
      subject: `🆕 Nouvelle commande — ${data.clientName} (${data.total.toFixed(2)} $)`,
      html: adminHtml,
    });

    return { success: true };
  }
);

interface CustomOrderData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  productType: string;
  occasion: string;
  quantity: string;
  deliveryDate?: string;
  description: string;
}

export const sendCustomOrderEmail = functions.onCall(
  { secrets: [EMAIL_USER, EMAIL_PASS, EMAIL_RECIPIENT] },
  async (request) => {
    const data = request.data as CustomOrderData;

    const user = EMAIL_USER.value();
    const pass = EMAIL_PASS.value();
    const recipient = EMAIL_RECIPIENT.value() || user;

    if (!user || !pass) {
      throw new functions.HttpsError("failed-precondition", "Email non configuré");
    }

    if (!data.clientName || !data.clientEmail || !data.clientPhone || !data.description) {
      throw new functions.HttpsError("invalid-argument", "Champs manquants");
    }

    const transporter = createTransporter(user, pass);

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2c2c2c;">
        <div style="background:#6E260E;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;">🎨 Nouvelle demande de personnalisation</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #f0e0d0;border-top:none;">
          <div style="background:#fff8f2;border:1px solid #f0d8c0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;color:#6E260E;">👤 Client</h3>
            <p style="margin:4px 0;"><strong>Nom :</strong> ${data.clientName}</p>
            <p style="margin:4px 0;"><strong>Email :</strong> <a href="mailto:${data.clientEmail}" style="color:#6E260E;">${data.clientEmail}</a></p>
            <p style="margin:4px 0;"><strong>Téléphone :</strong> ${data.clientPhone}</p>
          </div>
          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;">🎂 Détails</h3>
          <p style="margin:4px 0;"><strong>Type de produit :</strong> ${data.productType}</p>
          <p style="margin:4px 0;"><strong>Occasion :</strong> ${data.occasion || "Non précisée"}</p>
          <p style="margin:4px 0;"><strong>Quantité :</strong> ${data.quantity}</p>
          ${data.deliveryDate ? `<p style="margin:4px 0;"><strong>Date souhaitée :</strong> ${data.deliveryDate}</p>` : ""}
          <h3 style="color:#6E260E;border-bottom:2px solid #f5ede4;padding-bottom:6px;margin-top:20px;">📝 Description</h3>
          <p style="line-height:1.7;background:#f9f5f2;padding:12px;border-radius:6px;">${data.description.replace(/\n/g, "<br>")}</p>
        </div>
        <div style="background:#f9f0e8;padding:12px;text-align:center;border-radius:0 0 12px 12px;font-size:0.85rem;color:#999;">
          Joycy Bakery — Demande de personnalisation
        </div>
      </div>`;

    await transporter.sendMail({
      from: `"Joycy Bakery" <${user}>`,
      to: recipient,
      replyTo: data.clientEmail,
      subject: `🎨 Personnalisation — ${data.clientName} (${data.productType})`,
      html: adminHtml,
    });

    const clientHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2c2c2c;">
        <div style="background:#6E260E;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:1.5rem;">🍪 Joycy Bakery</h1>
          <p style="color:#f5e6d0;margin:6px 0 0;">Demande de personnalisation reçue</p>
        </div>
        <div style="background:#fff;padding:28px;border:1px solid #f0e0d0;border-top:none;">
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          <p>Merci pour votre demande ! Nous l'avons bien reçue et vous contacterons très bientôt pour discuter des détails et vous confirmer le prix.</p>
          <div style="background:#f5ede4;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:4px 0;"><strong>Produit :</strong> ${data.productType}</p>
            ${data.occasion ? `<p style="margin:4px 0;"><strong>Occasion :</strong> ${data.occasion}</p>` : ""}
            <p style="margin:4px 0;"><strong>Quantité :</strong> ${data.quantity}</p>
            ${data.deliveryDate ? `<p style="margin:4px 0;"><strong>Date souhaitée :</strong> ${data.deliveryDate}</p>` : ""}
          </div>
          <div style="background:#f5ede4;padding:16px;border-radius:8px;text-align:center;">
            <p style="margin:0;color:#6E260E;">Des questions ? Contactez-nous par téléphone ou WhatsApp.</p>
          </div>
        </div>
        <div style="background:#f9f0e8;padding:16px;text-align:center;border-radius:0 0 12px 12px;font-size:0.85rem;color:#999;">
          Joycy Bakery — Québec City
        </div>
      </div>`;

    await transporter.sendMail({
      from: `"Joycy Bakery" <${user}>`,
      to: data.clientEmail,
      subject: "✅ Votre demande de personnalisation — Joycy Bakery",
      html: clientHtml,
    });

    return { success: true };
  }
);
