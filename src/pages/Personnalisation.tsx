import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const OCCASIONS = [
  'Anniversaire',
  'Mariage',
  'Baptême',
  'Diplômation',
  'Fête des mères / pères',
  'Saint-Valentin',
  'Noël',
  'Événement corporatif',
  'Autre',
];

export default function Personnalisation() {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    productType: '' as 'Cookies' | 'Crêpes' | 'Gâteaux' | '',
    occasion: '',
    quantity: '',
    deliveryDate: '',
    description: '',
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.productType || !form.description) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSending(true);
    try {
      const functions = getFunctions();
      const sendCustomOrderEmail = httpsCallable(functions, 'sendCustomOrderEmail');
      await sendCustomOrderEmail({
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        productType: form.productType,
        occasion: form.occasion,
        quantity: form.quantity || 'Non précisée',
        deliveryDate: form.deliveryDate || undefined,
        description: form.description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="personnalisation-page">
        <div className="personnalisation-hero">
          <h1>🎨 Personnalisation</h1>
        </div>
        <div className="custom-success">
          <div className="custom-success-icon">✅</div>
          <h2>Demande envoyée !</h2>
          <p>Merci <strong>{form.clientName}</strong> ! Votre demande a bien été reçue.</p>
          <p>Nous vous contacterons très bientôt pour discuter des détails et confirmer le prix.</p>
          <p className="custom-success-note">Un email de confirmation vous a été envoyé à <strong>{form.clientEmail}</strong>.</p>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ clientName: '', clientEmail: '', clientPhone: '', productType: '', occasion: '', quantity: '', deliveryDate: '', description: '' }); }}>
            Faire une autre demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personnalisation-page">
      <div className="personnalisation-hero">
        <h1>🎨 Personnalisation</h1>
        <p>Créez votre commande sur mesure — gâteau, cookies ou crêpes selon vos envies</p>
      </div>

      <div className="personnalisation-content">
        <form onSubmit={handleSubmit} className="custom-order-form">
          <h2>Votre demande</h2>

          {error && <div className="error-message">❌ {error}</div>}

          <fieldset className="form-fieldset">
            <legend>Vos coordonnées</legend>
            <div className="form-group">
              <label>Nom complet *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                placeholder="Votre nom"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                  placeholder="+1 (819) 000-0000"
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Votre commande</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Type de produit *</label>
                <select
                  value={form.productType}
                  onChange={e => setForm({ ...form, productType: e.target.value as any })}
                  required
                >
                  <option value="">-- Choisir --</option>
                  <option value="Cookies">🍪 Cookies</option>
                  <option value="Crêpes">🥞 Crêpes</option>
                  <option value="Gâteaux">🎂 Gâteaux</option>
                </select>
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select
                  value={form.occasion}
                  onChange={e => setForm({ ...form, occasion: e.target.value })}
                >
                  <option value="">-- Choisir --</option>
                  {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantité souhaitée</label>
                <input
                  type="text"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Ex : 24 cookies, 1 gâteau 6 parts…"
                />
              </div>
              <div className="form-group">
                <label>Date souhaitée</label>
                <div className="date-input-wrapper">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={form.deliveryDate}
                    onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button type="button" className="date-picker-btn" onClick={() => dateInputRef.current?.showPicker()}>
                    📅
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Description de votre projet *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez en détail votre idée :&#10;- Saveurs, couleurs, décorations&#10;- Thème de l'événement&#10;- Allergies ou restrictions alimentaires&#10;- Toute autre information importante…"
                rows={7}
                required
              />
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-large" disabled={sending}>
            {sending ? 'Envoi en cours...' : '✉️ Envoyer ma demande'}
          </button>
        </form>

        <div className="custom-order-info">
          <h2>Comment ça marche ?</h2>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <div>
                <h3>Remplissez le formulaire</h3>
                <p>Décrivez votre projet, l'occasion et la quantité souhaitée</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <div>
                <h3>Nous vous contactons</h3>
                <p>On revient vers vous dans les 24h pour discuter des détails</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <div>
                <h3>Confirmation & paiement</h3>
                <p>Une fois le prix validé, vous confirmez et on prépare votre commande</p>
              </div>
            </div>
          </div>

          <div className="custom-examples">
            <h3>Idées de personnalisation</h3>
            <div className="examples-grid">
              <div className="example-card">
                <div className="example-icon">🍪</div>
                <h4>Cookies</h4>
                <p>Pépites de chocolat noir, blanc ou caramel, noisettes, M&M's, glaçage personnalisé…</p>
              </div>
              <div className="example-card">
                <div className="example-icon">🥞</div>
                <h4>Crêpes</h4>
                <p>Saveurs vanille, citron, chocolat, fruits rouges, garnitures sur mesure…</p>
              </div>
              <div className="example-card">
                <div className="example-icon">🎂</div>
                <h4>Gâteaux</h4>
                <p>Thématiques : anniversaire, mariage, baptême, diplômation, cake design…</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
