import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
    productType: '' as 'Cookies' | 'Crêpes' | 'Gâteaux' | 'Autres' | '',
    occasion: '',
    deliveryDate: '',
    quantity: '',
    flavors: '',
    colors: '',
    decoration: '',
    allergies: '',
    description: '',
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.productType) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSending(true);
    try {
      const descriptionFull = [
        form.flavors    ? `Saveurs : ${form.flavors}`                    : '',
        form.colors     ? `Couleurs : ${form.colors}`                    : '',
        form.decoration ? `Décoration : ${form.decoration}`              : '',
        form.allergies  ? `Allergies/Restrictions : ${form.allergies}`   : '',
        form.description? `Description : ${form.description}`            : '',
      ].filter(Boolean).join('\n');

      // Sauvegarde Firestore
      await addDoc(collection(db, 'customOrders'), {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        productType: form.productType,
        occasion: form.occasion || '',
        quantity: form.quantity || '',
        deliveryDate: form.deliveryDate || '',
        flavors: form.flavors || '',
        colors: form.colors || '',
        decoration: form.decoration || '',
        allergies: form.allergies || '',
        description: form.description || '',
        status: 'new',
        createdAt: serverTimestamp(),
      });

      // Email
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
        description: descriptionFull,
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
          <button className="btn btn-primary" onClick={() => {
            setSubmitted(false);
            setForm({ clientName: '', clientEmail: '', clientPhone: '', productType: '', occasion: '', deliveryDate: '', quantity: '', flavors: '', colors: '', decoration: '', allergies: '', description: '' });
          }}>
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

      {/* Comment ça marche — au dessus */}
      <div className="custom-how-it-works">
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
      </div>

      <div className="personnalisation-content">
        <form onSubmit={handleSubmit} className="custom-order-form">

          {error && <div className="error-message">❌ {error}</div>}

          {/* BLOC 1 — Coordonnées */}
          <div className="custom-bloc">
            <div className="custom-bloc-header">
              <span className="custom-bloc-icon">👤</span>
              <h3>Vos coordonnées</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-group">
                <label>Nom complet <span className="required">*</span></label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Numéro de téléphone <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                    placeholder="+1 (819) 000-0000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                    placeholder="jkuibia@gmail.com"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOC 2 — Commande */}
          <div className="custom-bloc">
            <div className="custom-bloc-header">
              <span className="custom-bloc-icon">🛍️</span>
              <h3>Votre commande</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Type de produit <span className="required">*</span></label>
                  <div className="product-type-grid">
                    {[
                      { value: 'Gâteaux', emoji: '🎂', label: 'Gâteaux' },
                      { value: 'Cookies', emoji: '🍪', label: 'Cookies' },
                      { value: 'Crêpes',  emoji: '🥞', label: 'Crêpes'  },
                      { value: 'Autres',  emoji: '✨', label: 'Autres'  },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`product-type-btn${form.productType === opt.value ? ' active' : ''}`}
                        onClick={() => setForm({ ...form, productType: opt.value as any })}
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
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
                <div className="form-group">
                  <label>Quantité souhaitée</label>
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder="Ex : 24 cookies, 1 gâteau 6 parts…"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOC 3 — Description */}
          <div className="custom-bloc">
            <div className="custom-bloc-header">
              <span className="custom-bloc-icon">📝</span>
              <h3>Description</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Saveurs</label>
                  <input
                    type="text"
                    value={form.flavors}
                    onChange={e => setForm({ ...form, flavors: e.target.value })}
                    placeholder="Ex : chocolat noir, vanille, framboise…"
                  />
                </div>
                <div className="form-group">
                  <label>Couleurs</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={e => setForm({ ...form, colors: e.target.value })}
                    placeholder="Ex : rose et blanc, doré, arc-en-ciel…"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Décoration</label>
                  <input
                    type="text"
                    value={form.decoration}
                    onChange={e => setForm({ ...form, decoration: e.target.value })}
                    placeholder="Ex : fleurs en sucre, figurines, lettres…"
                  />
                </div>
                <div className="form-group">
                  <label>Allergies / Restrictions</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={e => setForm({ ...form, allergies: e.target.value })}
                    placeholder="Ex : sans gluten, sans lactose, noix…"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description complémentaire</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Tout autre détail important pour votre commande…"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={sending}>
            {sending ? 'Envoi en cours...' : '✉️ Envoyer ma demande'}
          </button>
        </form>

      </div>

      {/* Idées de personnalisation — en bas */}
      <div className="custom-ideas-section">
        <h2>Idées de personnalisation</h2>
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
  );
}
