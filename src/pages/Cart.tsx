import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  deliveryDate: string;
  delivery: 'pickup' | 'home' | '';
  address: string;
  notes: string;
  payment: 'interac' | 'cash' | '';
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '', email: '', deliveryDate: '', delivery: '', address: '', notes: '', payment: '' });
  const [addressError, setAddressError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = () => setShowModal(true);

  const DELIVERY_FEE = 10;
  const isDelivery = form.delivery === 'home';
  const orderTotal = getTotal() + (isDelivery ? DELIVERY_FEE : 0);

  const verifyQuebecCity = async (addr: string): Promise<boolean> => {
    const query = encodeURIComponent(addr + ', Canada');
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await res.json();
    if (!data || data.length === 0) return false;
    const details = data[0].address;
    const city = (details.city || details.town || details.municipality || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const state = (details.state || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return city.includes('quebec') && state.includes('quebec');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (isDelivery) {
      if (!form.address.trim()) {
        setAddressError('Veuillez entrer votre adresse.');
        return;
      }
      setSubmitting(true);
      let isQC = false;
      try {
        isQC = await verifyQuebecCity(form.address);
      } catch {
        setAddressError('Impossible de vérifier l\'adresse. Vérifiez votre connexion.');
        setSubmitting(false);
        return;
      }
      if (!isQC) {
        setAddressError('Désolé, la livraison est disponible uniquement dans la ville de Québec.');
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);
    try {
      const deliveryLabel = isDelivery
        ? `Livraison à domicile (+${DELIVERY_FEE},00 $) - ${form.address}`
        : 'Ramassage gratuit (Pick-up)';

      await addDoc(collection(db, 'orders'), {
        userId: 'online-order',
        userEmail: form.email || form.phone,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: orderTotal,
        status: 'pending',
        notes: `Client: ${form.name}${form.phone ? ' - Tél: ' + form.phone : ''}\nLivraison: ${deliveryLabel}\nPaiement: ${form.payment === 'interac' ? 'Virement Interac' : 'Espèces'}${form.notes ? '\nNotes: ' + form.notes : ''}`,
        deliveryDate: form.deliveryDate,
        isPhoneOrder: false,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      clearCart();
    } catch {
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSuccess(false);
    setStep(1);
    setForm({ name: '', phone: '', email: '', deliveryDate: '', delivery: '', address: '', notes: '', payment: '' });
    if (success) navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>🛒 Votre Panier</h1>
          <div className="empty-cart-message">
            <p className="empty-icon">🛍️</p>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos délicieuses créations et ajoutez-les à votre panier !</p>
            <div className="empty-cart-actions">
              <button onClick={() => navigate('/promotions')} className="btn btn-primary">
                Voir les Promotions
              </button>
              <button onClick={() => navigate('/personnalisation')} className="btn btn-secondary">
                Créer une Commande Personnalisée
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Votre Panier</h1>
        <button onClick={clearCart} className="btn btn-danger btn-small">
          Vider le panier
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                {item.description && (
                  <p className="cart-item-description">{item.description}</p>
                )}
                {item.customization && (
                  <div className="cart-item-customization">
                    <strong>Personnalisation :</strong>
                    <p>{item.customization}</p>
                  </div>
                )}
                <div className="cart-item-type">
                  {item.type === 'promotion' ? '🎁 Promotion' : '🎨 Personnalisé'}
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn-quantity"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="btn-quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-price">
                  <span className="price">{(item.price * item.quantity).toFixed(2)} $</span>
                  <span className="price-unit">({item.price.toFixed(2)} $ / unité)</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn btn-danger btn-small"
                >
                  🗑️ Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Résumé de la commande</h2>
          
          <div className="summary-line">
            <span>Nombre d'articles :</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>

          <div className="summary-line">
            <span>Sous-total :</span>
            <span>{getTotal().toFixed(2)} $</span>
          </div>

          <div className="summary-line delivery-note">
            <span>Livraison :</span>
            <span>À déterminer</span>
          </div>

          <div className="summary-total">
            <span>Total estimé :</span>
            <span>{getTotal().toFixed(2)} $</span>
          </div>

          <div className="delivery-options-summary">
            <h3>Options de livraison :</h3>
            <ul>
              <li>📍 Ramassage gratuit à Québec City</li>
              <li>🚗 Livraison à domicile : 10,00 $ (Québec)</li>
            </ul>
          </div>

          <button onClick={handleCheckout} className="btn btn-primary btn-large">
            Passer la commande
          </button>

          <p className="checkout-note">
            💡 Nous vous contacterons pour confirmer les détails et finaliser votre commande
          </p>
        </div>
      </div>

      {showModal && (
        <div className="checkout-overlay" onClick={handleCloseModal}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            {success ? (
              <div className="checkout-success">
                <p className="checkout-success-icon">✅</p>
                <h2>Commande envoyée !</h2>
                <p>Nous vous contacterons très bientôt pour confirmer les détails.</p>
                <button className="btn btn-primary" onClick={handleCloseModal}>
                  Retour à l'accueil
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-modal-header">
                  <h2>📋 Finaliser la commande</h2>
                  <button className="checkout-close" onClick={handleCloseModal}>✕</button>
                </div>

                <div className="checkout-steps">
                  <span className={step === 1 ? 'checkout-step active' : 'checkout-step done'}>1. Vos infos</span>
                  <span className="checkout-step-sep">›</span>
                  <span className={step === 2 ? 'checkout-step active' : step > 2 ? 'checkout-step done' : 'checkout-step'}>2. Livraison</span>
                  <span className="checkout-step-sep">›</span>
                  <span className={step === 3 ? 'checkout-step active' : 'checkout-step'}>3. Paiement</span>
                </div>

                {step === 1 && (
                  <div className="checkout-form">
                    <div className="form-group">
                      <label htmlFor="co-name">Nom complet *</label>
                      <input
                        id="co-name"
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-phone">Téléphone *</label>
                      <input
                        id="co-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Ex: 418-555-0000"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-email">Email</label>
                      <input
                        id="co-email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Votre email (optionnel)"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-date">Date de livraison souhaitée</label>
                      <div className="date-input-wrapper">
                        <input
                          id="co-date"
                          ref={dateInputRef}
                          type="date"
                          value={form.deliveryDate}
                          onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <button
                          type="button"
                          className="date-picker-btn"
                          onClick={() => dateInputRef.current?.showPicker()}
                        >
                          📅
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-large"
                      onClick={() => {
                        if (!form.name.trim() || !form.phone.trim()) {
                          alert('Veuillez remplir votre nom et téléphone.');
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Suivant →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmitOrder} className="checkout-form">
                    <div className="form-group">
                      <label>Mode de livraison *</label>
                      <div className="delivery-choice">
                        <label className={`delivery-option-card${form.delivery === 'pickup' ? ' selected' : ''}`}>
                          <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={form.delivery === 'pickup'}
                            onChange={() => setForm(f => ({ ...f, delivery: 'pickup', address: '' }))}
                            required
                          />
                          <span className="delivery-option-icon">📍</span>
                          <span className="delivery-option-text">
                            <strong>Ramassage (Pick-up)</strong>
                            <small>Gratuit — Québec City</small>
                          </span>
                        </label>
                        <label className={`delivery-option-card${form.delivery === 'home' ? ' selected' : ''}`}>
                          <input
                            type="radio"
                            name="delivery"
                            value="home"
                            checked={form.delivery === 'home'}
                            onChange={() => setForm(f => ({ ...f, delivery: 'home' }))}
                          />
                          <span className="delivery-option-icon">🚗</span>
                          <span className="delivery-option-text">
                            <strong>Livraison à domicile</strong>
                            <small>10,00 $ — Québec City seulement</small>
                          </span>
                        </label>
                      </div>
                    </div>

                    {form.delivery === 'home' && (
                      <div className="form-group">
                        <label htmlFor="co-address">Adresse de livraison *</label>
                        <input
                          id="co-address"
                          type="text"
                          value={form.address}
                          onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setAddressError(''); }}
                          placeholder="Ex: 123 rue Saint-Jean, Québec, G1R 1R1"
                          required
                        />
                        {addressError && <p className="error-message" style={{ marginTop: '0.4rem' }}>{addressError}</p>}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="co-notes">Notes / Instructions spéciales</label>
                      <textarea
                        id="co-notes"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Allergies, préférences..."
                        rows={3}
                      />
                    </div>

                    <div className="checkout-order-summary">
                      <div className="checkout-total-lines">
                        <span>Sous-total : {getTotal().toFixed(2)} $</span>
                        {isDelivery && <span>Livraison : {DELIVERY_FEE},00 $</span>}
                      </div>
                      <strong>Total : {orderTotal.toFixed(2)} $</strong>
                    </div>

                    <div className="checkout-step2-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                        ← Retour
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-large"
                        onClick={() => {
                          if (!form.delivery) {
                            alert('Veuillez choisir un mode de livraison.');
                            return;
                          }
                          setStep(3);
                        }}
                      >
                        Suivant →
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleSubmitOrder} className="checkout-form">
                    <div className="form-group">
                      <label>Mode de paiement *</label>
                      <div className="payment-choice">

                        <label className={`payment-option-card${form.payment === 'interac' ? ' selected' : ''}`}>
                          <input type="radio" name="payment" value="interac" checked={form.payment === 'interac'}
                            onChange={() => setForm(f => ({ ...f, payment: 'interac' }))} required />
                          <span className="payment-option-icon">🏦</span>
                          <span className="payment-option-text">
                            <strong>Virement Interac</strong>
                            <small className="payment-available">✓ Disponible</small>
                          </span>
                        </label>

                        <label className={`payment-option-card${form.payment === 'cash' ? ' selected' : ''}`}>
                          <input type="radio" name="payment" value="cash" checked={form.payment === 'cash'}
                            onChange={() => setForm(f => ({ ...f, payment: 'cash' }))} />
                          <span className="payment-option-icon">💵</span>
                          <span className="payment-option-text">
                            <strong>Espèces</strong>
                            <small className="payment-available">✓ Disponible</small>
                          </span>
                        </label>

                        <div className="payment-option-card disabled">
                          <span className="payment-option-icon">💳</span>
                          <span className="payment-option-text">
                            <strong>Carte de crédit</strong>
                            <small className="payment-soon">Bientôt disponible</small>
                          </span>
                        </div>

                        <div className="payment-option-card disabled">
                          <span className="payment-option-icon">🅿️</span>
                          <span className="payment-option-text">
                            <strong>PayPal</strong>
                            <small className="payment-soon">Bientôt disponible</small>
                          </span>
                        </div>

                      </div>
                    </div>

                    <div className="checkout-order-summary">
                      <div className="checkout-total-lines">
                        <span>Sous-total : {getTotal().toFixed(2)} $</span>
                        {isDelivery && <span>Livraison : {DELIVERY_FEE},00 $</span>}
                      </div>
                      <strong>Total : {orderTotal.toFixed(2)} $</strong>
                    </div>

                    <div className="checkout-step2-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                        ← Retour
                      </button>
                      <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                        {submitting ? 'Envoi...' : 'Confirmer la commande'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
