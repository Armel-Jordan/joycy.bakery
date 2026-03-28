import { useState, useEffect } from 'react';
import { branding } from '../config/branding';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

interface DayHours {
  name: string;
  open: string;
  close: string;
  closed: boolean;
}

export default function Contact() {
  const { t } = useTranslation();
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
  const [hours, setHours] = useState<DayHours[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'businessHours')).then(snap => {
      if (snap.exists() && snap.data().days) setHours(snap.data().days);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const functions = getFunctions();
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');

      await sendContactEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitted(true);
      setSending(false);

      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contact.hero.title')}</h1>
        <p>{t('contact.hero.desc')}</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="contact-icon">📍</div>
            <h3>{t('contact.info.address')}</h3>
            <p>{branding.contact.address}<br />{branding.contact.country}</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">📧</div>
            <h3>{t('contact.info.email')}</h3>
            <p><a href={`mailto:${branding.contact.email}`}>{branding.contact.email}</a></p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">📱</div>
            <h3>{t('contact.info.phone')}</h3>
            <p><a href={`tel:${branding.contact.phone.replace(/[^+\d]/g, '')}`}>{branding.contact.phone}</a></p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">🕐</div>
            <h3>{t('contact.info.hours')}</h3>
            {hours ? (
              <p>
                {hours.map(d => (
                  <span key={d.name} style={{ display: 'block' }}>
                    {d.name} : {d.closed ? t('contact.info.closed') : `${d.open} – ${d.close}`}
                  </span>
                ))}
              </p>
            ) : (
              <p>
                {branding.hours.weekdays}<br />
                {branding.hours.saturday}<br />
                {branding.hours.sunday}
              </p>
            )}
          </div>
        </div>

        <div className="contact-form-section">
          <h2>{t('contact.form.title')}</h2>

          {submitted && (
            <div className="success-message">
              {t('contact.form.success')}
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
                <label htmlFor="name">{t('contact.form.fullName')}</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('contact.form.fullName').replace(' *', '')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('contact.form.email')}</label>
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
                <label htmlFor="phone">{t('contact.form.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (514) 555-1234"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">{t('contact.form.subject')}</label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">{t('contact.form.selectSubject')}</option>
                  <option value="commande">{t('contact.form.subjects.order')}</option>
                  <option value="info">{t('contact.form.subjects.info')}</option>
                  <option value="feedback">{t('contact.form.subjects.feedback')}</option>
                  <option value="autre">{t('contact.form.subjects.other')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('contact.form.message')}</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                placeholder={t('contact.form.messagePlaceholder')}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={sending}>
              {sending ? t('contact.form.sending') : t('contact.form.send')}
            </button>
          </form>
        </div>
      </div>

      <div className="contact-cta">
        <h2>{t('contact.cta.title')}</h2>
        <p>{t('contact.cta.desc')}</p>
        <div className="cta-buttons">
          <a href={`tel:${branding.contact.phone.replace(/[^+\d]/g, '')}`} className="btn btn-primary">
            {t('contact.cta.call')}
          </a>
          <a href={`https://wa.me/${branding.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            {t('contact.cta.whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
