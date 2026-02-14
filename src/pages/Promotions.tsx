import { useCart } from '../context/CartContext';

export default function Promotions() {
  const { addToCart } = useCart();

  const handleAddToCart = (name: string, price: number, description: string) => {
    addToCart({
      type: 'promotion',
      name,
      price,
      quantity: 1,
      description
    });
    alert(`${name} ajouté au panier !`);
  };

  return (
    <div className="promotions-page">
      <div className="promotions-hero">
        <h1>🎉 Promotions & Offres Spéciales</h1>
        <p>Profitez de nos offres avantageuses sur nos produits</p>
      </div>

      <div className="promotions-content">
        <div className="promo-section">
          <h2>🍪 Offres Cookies</h2>
          <div className="promo-cards">
            <div className="promo-card" onClick={() => handleAddToCart('Boîte de 3 Cookies', 11.00, 'Découverte - Parfait pour découvrir nos saveurs')}>
              <div className="promo-badge">Découverte</div>
              <h3>Boîte de 3 Cookies</h3>
              <div className="promo-price">
                <span className="price-main">11,00 $</span>
                <span className="price-unit">(3,67 $ / cookie)</span>
              </div>
              <p>Parfait pour découvrir nos saveurs</p>
              <button className="btn btn-add-cart">🛒 Ajouter au panier</button>
            </div>

            <div className="promo-card featured" onClick={() => handleAddToCart('Boîte de 6 Cookies', 20.00, 'Partage - Idéal pour partager en famille')}>
              <div className="promo-badge popular">Populaire</div>
              <h3>Boîte de 6 Cookies</h3>
              <div className="promo-price">
                <span className="price-main">20,00 $</span>
                <span className="price-unit">(3,33 $ / cookie)</span>
              </div>
              <p>Idéal pour partager en famille</p>
              <div className="savings">Économisez 4 $</div>
              <button className="btn btn-add-cart">🛒 Ajouter au panier</button>
            </div>

            <div className="promo-card" onClick={() => handleAddToCart('Boîte de 12 Cookies', 40.00, 'Événement - Pour vos fêtes et événements')}>
              <div className="promo-badge">Événement</div>
              <h3>Boîte de 12 Cookies</h3>
              <div className="promo-price">
                <span className="price-main">40,00 $</span>
                <span className="price-unit">(3,33 $ / cookie)</span>
              </div>
              <p>Pour vos fêtes et événements</p>
              <div className="savings">Économisez 8 $</div>
              <button className="btn btn-add-cart">🛒 Ajouter au panier</button>
            </div>
          </div>
        </div>

        <div className="promo-section">
          <h2>🥞 Offres Crêpes</h2>
          <div className="promo-cards">
            <div className="promo-card" onClick={() => handleAddToCart('13 Crêpes', 20.00, 'Nature, citron ou vanille')}>
              <h3>13 Crêpes</h3>
              <div className="promo-price">
                <span className="price-main">20,00 $</span>
                <span className="price-unit">(1,54 $ / crêpe)</span>
              </div>
              <p>Nature, citron ou vanille</p>
              <button className="btn btn-add-cart">🛒 Ajouter au panier</button>
            </div>

            <div className="promo-card featured" onClick={() => handleAddToCart('30 Crêpes', 40.00, 'Nature, citron ou vanille - Meilleure valeur')}>
              <div className="promo-badge popular">Meilleure Valeur</div>
              <h3>30 Crêpes</h3>
              <div className="promo-price">
                <span className="price-main">40,00 $</span>
                <span className="price-unit">(1,33 $ / crêpe)</span>
              </div>
              <p>Nature, citron ou vanille</p>
              <div className="savings">Économisez 6 $</div>
              <button className="btn btn-add-cart">🛒 Ajouter au panier</button>
            </div>
          </div>
        </div>

        <div className="delivery-info">
          <h2>🚚 Options de Livraison</h2>
          <div className="delivery-options">
            <div className="delivery-option">
              <div className="delivery-icon">📍</div>
              <div className="delivery-details">
                <h3>Ramassage Gratuit (Pick-up)</h3>
                <p>À Québec City - Gratuit</p>
              </div>
            </div>
            <div className="delivery-option">
              <div className="delivery-icon">🚗</div>
              <div className="delivery-details">
                <h3>Livraison à Domicile</h3>
                <p>Dans la ville de Québec - 10,00 $</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
