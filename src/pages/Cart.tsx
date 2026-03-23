import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  deliveryDate: string;
  notes: string;
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '', email: '', deliveryDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = () => setShowModal(true);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: 'online-order',
        userEmail: form.email || form.phone,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotal(),
        status: 'pending',
        notes: `Client: ${form.name}${form.phone ? ' - Tél: ' + form.phone : ''}${form.notes ? '\nNotes: ' + form.notes : ''}`,
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
    setForm({ name: '', phone: '', email: '', deliveryDate: '', notes: '' });
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
                <form onSubmit={handleSubmitOrder} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="co-name">Nom complet *</label>
                    <input
                      id="co-name"
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Votre nom"
                      required
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
                      required
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
                    <input
                      id="co-date"
                      type="date"
                      value={form.deliveryDate}
                      onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="co-notes">Notes / Instructions spéciales</label>
                    <textarea
                      id="co-notes"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Allergies, préférences, adresse de livraison..."
                      rows={3}
                    />
                  </div>
                  <div className="checkout-order-summary">
                    <strong>Total : {getTotal().toFixed(2)} $</strong>
                  </div>
                  <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                    {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
