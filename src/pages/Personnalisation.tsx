import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

export default function Personnalisation() {
  const { t } = useTranslation();
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

  const OCCASIONS = [
    { value: 'Anniversaire',            label: t('personnalisation.occasions.birthday') },
    { value: 'Mariage',                 label: t('personnalisation.occasions.wedding') },
    { value: 'Baptême',                 label: t('personnalisation.occasions.baptism') },
    { value: 'Diplômation',             label: t('personnalisation.occasions.graduation') },
    { value: 'Fête des mères / pères',  label: t('personnalisation.occasions.parentsDay') },
    { value: 'Saint-Valentin',          label: t('personnalisation.occasions.valentine') },
    { value: 'Noël',                    label: t('personnalisation.occasions.christmas') },
    { value: 'Événement corporatif',    label: t('personnalisation.occasions.corporate') },
    { value: 'Autre',                   label: t('personnalisation.occasions.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.productType) {
      setError(t('personnalisation.required'));
      return;
    }

    setSending(true);
    try {
      const descriptionFull = [
        form.flavors     ? `Saveurs : ${form.flavors}`                  : '',
        form.colors      ? `Couleurs : ${form.colors}`                  : '',
        form.decoration  ? `Décoration : ${form.decoration}`            : '',
        form.allergies   ? `Allergies/Restrictions : ${form.allergies}` : '',
        form.description ? `Description : ${form.description}`          : '',
      ].filter(Boolean).join('\n');

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
      setError(err.message || t('personnalisation.error'));
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="personnalisation-page">
        <div className="personnalisation-hero">
          <h1>{t('personnalisation.hero.title')}</h1>
        </div>
        <div className="custom-success">
          <div className="custom-success-icon">✅</div>
          <h2>{t('personnalisation.success.title')}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('personnalisation.success.thanks', { name: form.clientName }) }} />
          <p>{t('personnalisation.success.willContact')}</p>
          <p className="custom-success-note" dangerouslySetInnerHTML={{ __html: t('personnalisation.success.emailSent', { email: form.clientEmail }) }} />
          <button className="btn btn-primary" onClick={() => {
            setSubmitted(false);
            setForm({ clientName: '', clientEmail: '', clientPhone: '', productType: '', occasion: '', deliveryDate: '', quantity: '', flavors: '', colors: '', decoration: '', allergies: '', description: '' });
          }}>
            {t('personnalisation.success.another')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personnalisation-page">
      <div className="personnalisation-hero">
        <h1>{t('personnalisation.hero.title')}</h1>
        <p>{t('personnalisation.hero.desc')}</p>
      </div>

      {/* Comment ça marche */}
      <div className="custom-how-it-works">
        <h2>{t('personnalisation.howItWorks.title')}</h2>
        <div className="info-steps">
          <div className="info-step">
            <span className="step-number">1</span>
            <div>
              <h3>{t('personnalisation.howItWorks.step1.title')}</h3>
              <p>{t('personnalisation.howItWorks.step1.desc')}</p>
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">2</span>
            <div>
              <h3>{t('personnalisation.howItWorks.step2.title')}</h3>
              <p>{t('personnalisation.howItWorks.step2.desc')}</p>
            </div>
          </div>
          <div className="info-step">
            <span className="step-number">3</span>
            <div>
              <h3>{t('personnalisation.howItWorks.step3.title')}</h3>
              <p>{t('personnalisation.howItWorks.step3.desc')}</p>
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
              <h3>{t('personnalisation.bloc1.title')}</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-group">
                <label>{t('personnalisation.bloc1.name')} <span className="required">*</span></label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  placeholder={t('personnalisation.bloc1.namePlaceholder')}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('personnalisation.bloc1.phone')} <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                    placeholder={t('personnalisation.bloc1.phonePlaceholder')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('personnalisation.bloc1.email')} <span className="required">*</span></label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                    placeholder="email@example.com"
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
              <h3>{t('personnalisation.bloc2.title')}</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('personnalisation.bloc2.productType')} <span className="required">*</span></label>
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
                  <label>{t('personnalisation.bloc2.occasion')}</label>
                  <select
                    value={form.occasion}
                    onChange={e => setForm({ ...form, occasion: e.target.value })}
                  >
                    <option value="">{t('personnalisation.bloc2.occasionPlaceholder')}</option>
                    {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('personnalisation.bloc2.date')}</label>
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
                  <label>{t('personnalisation.bloc2.quantity')}</label>
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder={t('personnalisation.bloc2.quantityPlaceholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOC 3 — Description */}
          <div className="custom-bloc">
            <div className="custom-bloc-header">
              <span className="custom-bloc-icon">📝</span>
              <h3>{t('personnalisation.bloc3.title')}</h3>
            </div>
            <div className="custom-bloc-body">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('personnalisation.bloc3.flavors')}</label>
                  <input
                    type="text"
                    value={form.flavors}
                    onChange={e => setForm({ ...form, flavors: e.target.value })}
                    placeholder={t('personnalisation.bloc3.flavorsPlaceholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('personnalisation.bloc3.colors')}</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={e => setForm({ ...form, colors: e.target.value })}
                    placeholder={t('personnalisation.bloc3.colorsPlaceholder')}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('personnalisation.bloc3.decoration')}</label>
                  <input
                    type="text"
                    value={form.decoration}
                    onChange={e => setForm({ ...form, decoration: e.target.value })}
                    placeholder={t('personnalisation.bloc3.decorationPlaceholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('personnalisation.bloc3.allergies')}</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={e => setForm({ ...form, allergies: e.target.value })}
                    placeholder={t('personnalisation.bloc3.allergiesPlaceholder')}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('personnalisation.bloc3.description')}</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={t('personnalisation.bloc3.descriptionPlaceholder')}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={sending}>
            {sending ? t('personnalisation.sending') : t('personnalisation.submit')}
          </button>
        </form>
      </div>

      {/* Idées de personnalisation */}
      <div className="custom-ideas-section">
        <h2>{t('personnalisation.ideas.title')}</h2>
        <div className="examples-grid">
          <div className="example-card">
            <div className="example-icon">🍪</div>
            <h4>{t('personnalisation.ideas.cookies.name')}</h4>
            <p>{t('personnalisation.ideas.cookies.desc')}</p>
          </div>
          <div className="example-card">
            <div className="example-icon">🥞</div>
            <h4>{t('personnalisation.ideas.crepes.name')}</h4>
            <p>{t('personnalisation.ideas.crepes.desc')}</p>
          </div>
          <div className="example-card">
            <div className="example-icon">🎂</div>
            <h4>{t('personnalisation.ideas.cakes.name')}</h4>
            <p>{t('personnalisation.ideas.cakes.desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
