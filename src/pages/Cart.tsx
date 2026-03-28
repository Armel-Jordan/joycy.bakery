import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        setAddressError(t('cart.errors.enterAddress'));
        return;
      }
      setSubmitting(true);
      let isQC = false;
      try {
        isQC = await verifyQuebecCity(form.address);
      } catch {
        setAddressError(t('cart.errors.addressCheck'));
        setSubmitting(false);
        return;
      }
      if (!isQC) {
        setAddressError(t('cart.errors.quebecOnly'));
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

      if (form.email) {
        try {
          const functions = getFunctions();
          const sendOrderConfirmationEmail = httpsCallable(functions, 'sendOrderConfirmationEmail');
          await sendOrderConfirmationEmail({
            clientName: form.name,
            clientEmail: form.email,
            clientPhone: form.phone,
            items: cartItems.map(item => ({
              productName: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total: orderTotal,
            deliveryMode: form.delivery,
            deliveryAddress: form.address || undefined,
            deliveryDate: form.deliveryDate || undefined,
            paymentMethod: form.payment,
            notes: form.notes || undefined,
          });
        } catch {
          console.warn('Email de confirmation non envoyé');
        }
      }

      setSuccess(true);
      clearCart();
    } catch {
      alert(t('cart.errors.orderFailed'));
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
          <h1>{t('cart.title')}</h1>
          <div className="empty-cart-message">
            <p className="empty-icon">🛍️</p>
            <h2>{t('cart.empty.title')}</h2>
            <p>{t('cart.empty.desc')}</p>
            <div className="empty-cart-actions">
              <button onClick={() => navigate('/promotions')} className="btn btn-primary">
                {t('cart.empty.seePromos')}
              </button>
              <button onClick={() => navigate('/personnalisation')} className="btn btn-secondary">
                {t('cart.empty.createCustom')}
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
        <h1>{t('cart.title')}</h1>
        <button onClick={clearCart} className="btn btn-danger btn-small">
          {t('cart.clearCart')}
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
                    <strong>{t('cart.customization')}</strong>
                    <p>{item.customization}</p>
                  </div>
                )}
                <div className="cart-item-type">
                  {item.type === 'promotion' ? t('cart.typePromo') : t('cart.typeCustom')}
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn-quantity"
                  >-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="btn-quantity"
                  >+</button>
                </div>

                <div className="cart-item-price">
                  <span className="price">{(item.price * item.quantity).toFixed(2)} $</span>
                  <span className="price-unit">({item.price.toFixed(2)} $ / unité)</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn btn-danger btn-small"
                >
                  🗑️ {t('cart.clearCart').split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>{t('cart.summary.title')}</h2>

          <div className="summary-line">
            <span>{t('cart.summary.itemCount')}</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>

          <div className="summary-line">
            <span>{t('cart.summary.subtotal')}</span>
            <span>{getTotal().toFixed(2)} $</span>
          </div>

          <div className="summary-line delivery-note">
            <span>{t('cart.summary.delivery')}</span>
            <span>{t('cart.summary.toConfirm')}</span>
          </div>

          <div className="summary-total">
            <span>{t('cart.summary.estimatedTotal')}</span>
            <span>{getTotal().toFixed(2)} $</span>
          </div>

          <div className="delivery-options-summary">
            <h3>Options de livraison :</h3>
            <ul>
              <li>{t('cart.summary.pickup')}</li>
              <li>{t('cart.summary.home')}</li>
            </ul>
          </div>

          <button onClick={handleCheckout} className="btn btn-primary btn-large">
            {t('cart.checkout')}
          </button>

          <p className="checkout-note">{t('cart.checkoutNote')}</p>
        </div>
      </div>

      {showModal && (
        <div className="checkout-overlay" onClick={handleCloseModal}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            {success ? (
              <div className="checkout-success">
                <p className="checkout-success-icon">✅</p>
                <h2>{t('cart.success.title')}</h2>
                <p>{t('cart.success.desc')}</p>
                <button className="btn btn-primary" onClick={handleCloseModal}>
                  {t('cart.success.back')}
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-modal-header">
                  <h2>{t('cart.modal.title')}</h2>
                  <button className="checkout-close" onClick={handleCloseModal}>✕</button>
                </div>

                <div className="checkout-steps">
                  <span className={step === 1 ? 'checkout-step active' : 'checkout-step done'}>{t('cart.modal.step1')}</span>
                  <span className="checkout-step-sep">›</span>
                  <span className={step === 2 ? 'checkout-step active' : step > 2 ? 'checkout-step done' : 'checkout-step'}>{t('cart.modal.step2')}</span>
                  <span className="checkout-step-sep">›</span>
                  <span className={step === 3 ? 'checkout-step active' : 'checkout-step'}>{t('cart.modal.step3')}</span>
                </div>

                {step === 1 && (
                  <div className="checkout-form">
                    <div className="form-group">
                      <label htmlFor="co-name">{t('cart.form.fullName')}</label>
                      <input
                        id="co-name"
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={t('cart.form.namePlaceholder')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-phone">{t('cart.form.phone')}</label>
                      <input
                        id="co-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={t('cart.form.phonePlaceholder')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-email">{t('cart.form.email')}</label>
                      <input
                        id="co-email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder={t('cart.form.emailOptional')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="co-date">{t('cart.form.deliveryDate')}</label>
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
                        >📅</button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-large"
                      onClick={() => {
                        if (!form.name.trim() || !form.phone.trim()) {
                          alert(t('cart.errors.fillName'));
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      {t('cart.modal.next')}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmitOrder} className="checkout-form">
                    <div className="form-group">
                      <label>{t('cart.form.deliveryMode')}</label>
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
                            <strong>{t('cart.delivery.pickup.title')}</strong>
                            <small>{t('cart.delivery.pickup.sub')}</small>
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
                            <strong>{t('cart.delivery.home.title')}</strong>
                            <small>{t('cart.delivery.home.sub')}</small>
                          </span>
                        </label>
                      </div>
                    </div>

                    {form.delivery === 'home' && (
                      <div className="form-group">
                        <label htmlFor="co-address">{t('cart.form.address')}</label>
                        <input
                          id="co-address"
                          type="text"
                          value={form.address}
                          onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setAddressError(''); }}
                          placeholder={t('cart.form.addressPlaceholder')}
                          required
                        />
                        {addressError && <p className="error-message" style={{ marginTop: '0.4rem' }}>{addressError}</p>}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="co-notes">{t('cart.form.notes')}</label>
                      <textarea
                        id="co-notes"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder={t('cart.form.notesPlaceholder')}
                        rows={3}
                      />
                    </div>

                    <div className="checkout-order-summary">
                      <div className="checkout-total-lines">
                        <span>{t('cart.totals.subtotal')} {getTotal().toFixed(2)} $</span>
                        {isDelivery && <span>{t('cart.totals.delivery')} {DELIVERY_FEE},00 $</span>}
                      </div>
                      <strong>{t('cart.totals.total')} {orderTotal.toFixed(2)} $</strong>
                    </div>

                    <div className="checkout-step2-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                        {t('cart.modal.back')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-large"
                        onClick={() => {
                          if (!form.delivery) {
                            alert(t('cart.errors.chooseDelivery'));
                            return;
                          }
                          setStep(3);
                        }}
                      >
                        {t('cart.modal.next')}
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleSubmitOrder} className="checkout-form">
                    <div className="form-group">
                      <label>{t('cart.form.paymentMode')}</label>
                      <div className="payment-choice">
                        <label className={`payment-option-card${form.payment === 'interac' ? ' selected' : ''}`}>
                          <input type="radio" name="payment" value="interac" checked={form.payment === 'interac'}
                            onChange={() => setForm(f => ({ ...f, payment: 'interac' }))} required />
                          <span className="payment-option-icon">🏦</span>
                          <span className="payment-option-text">
                            <strong>{t('cart.payment.interac')}</strong>
                            <small className="payment-available">{t('cart.payment.available')}</small>
                          </span>
                        </label>

                        <label className={`payment-option-card${form.payment === 'cash' ? ' selected' : ''}`}>
                          <input type="radio" name="payment" value="cash" checked={form.payment === 'cash'}
                            onChange={() => setForm(f => ({ ...f, payment: 'cash' }))} />
                          <span className="payment-option-icon">💵</span>
                          <span className="payment-option-text">
                            <strong>{t('cart.payment.cash')}</strong>
                            <small className="payment-available">{t('cart.payment.available')}</small>
                          </span>
                        </label>

                        <div className="payment-option-card disabled">
                          <span className="payment-option-icon">💳</span>
                          <span className="payment-option-text">
                            <strong>{t('cart.payment.credit')}</strong>
                            <small className="payment-soon">{t('cart.payment.soon')}</small>
                          </span>
                        </div>

                        <div className="payment-option-card disabled">
                          <span className="payment-option-icon">🅿️</span>
                          <span className="payment-option-text">
                            <strong>{t('cart.payment.paypal')}</strong>
                            <small className="payment-soon">{t('cart.payment.soon')}</small>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="checkout-order-summary">
                      <div className="checkout-total-lines">
                        <span>{t('cart.totals.subtotal')} {getTotal().toFixed(2)} $</span>
                        {isDelivery && <span>{t('cart.totals.delivery')} {DELIVERY_FEE},00 $</span>}
                      </div>
                      <strong>{t('cart.totals.total')} {orderTotal.toFixed(2)} $</strong>
                    </div>

                    <div className="checkout-step2-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                        {t('cart.modal.back')}
                      </button>
                      <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                        {submitting ? t('cart.sending') : t('cart.confirm')}
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
