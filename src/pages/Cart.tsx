import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    // Pour l'instant, juste afficher un message
    alert('Fonctionnalité de paiement à venir. Nous vous contacterons pour finaliser votre commande !');
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
    </div>
  );
}
