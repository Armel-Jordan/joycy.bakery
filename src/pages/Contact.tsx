import { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    // Check if EmailJS is configured
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS not configured. Message logged to console:', formData);
      setError('Le service d\'envoi d\'email n\'est pas configuré. Veuillez contacter l\'administrateur.');
      setSending(false);
      return;
    }

    try {
      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || 'Non fourni',
          subject: formData.subject,
          message: formData.message,
        },
        publicKey
      );

      setSubmitted(true);
      setSending(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>📞 Contactez-nous</h1>
        <p>Une question ? Un projet de gâteau personnalisé ? N'hésitez pas à nous écrire !</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="contact-icon">📍</div>
            <h3>Adresse</h3>
            <p>Québec, QC<br />Canada</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">📧</div>
            <h3>Email</h3>
            <p><a href="mailto:contact@joycybakery.com">contact@joycybakery.com</a></p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">📱</div>
            <h3>Téléphone</h3>
            <p><a href="tel:+15145551234">+1 (514) 555-1234</a></p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">🕐</div>
            <h3>Horaires</h3>
            <p>
              Lundi - Vendredi: 9h - 18h<br />
              Samedi: 10h - 16h<br />
              Dimanche: Fermé
            </p>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Envoyez-nous un message</h2>
          
          {submitted && (
            <div className="success-message">
              ✅ Merci ! Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (514) 555-1234"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet *</label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="commande">Commande personnalisée</option>
                  <option value="info">Demande d'information</option>
                  <option value="feedback">Commentaire/Suggestion</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                placeholder="Décrivez votre demande en détail..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={sending}>
              {sending ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>

      <div className="contact-cta">
        <h2>Besoin d'une réponse rapide ?</h2>
        <p>Pour les commandes urgentes ou les questions simples, contactez-nous directement par téléphone ou WhatsApp</p>
        <div className="cta-buttons">
          <a href="tel:+15145551234" className="btn btn-primary">
            📞 Appelez-nous
          </a>
          <a href="https://wa.me/18199238098" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
