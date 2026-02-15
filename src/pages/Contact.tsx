import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pour l'instant, on simule l'envoi
    console.log('Message envoyé:', formData);
    setSubmitted(true);
    
    // Réinitialiser le formulaire après 3 secondes
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

            <button type="submit" className="btn btn-primary btn-submit">
              Envoyer le message
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
