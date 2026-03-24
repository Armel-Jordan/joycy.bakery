import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface PriceTier {
  label: string;
  qty: number;
  price: number;
  custom?: boolean;
}

const COOKIE_TIERS: PriceTier[] = [
  { label: '1 cookie', qty: 1, price: 6.00 },
  { label: 'Boîte de 4', qty: 4, price: 20.00 },
  { label: 'Boîte de 6', qty: 6, price: 25.00 },
  { label: 'Boîte de 12', qty: 12, price: 45.00 },
  { label: 'Boîte de 24', qty: 24, price: 85.00 },
  { label: 'Autre quantité', qty: 0, price: 0, custom: true },
];

const CREPE_TIERS: PriceTier[] = [
  { label: '13 crêpes', qty: 13, price: 20.00 },
  { label: '30 crêpes', qty: 30, price: 40.00 },
  { label: '45 crêpes', qty: 45, price: 60.00 },
  { label: '60 crêpes', qty: 60, price: 70.00 },
  { label: 'Autre quantité', qty: 0, price: 0, custom: true },
];

const CREPE_FLAVORS = ['Nature', 'Citron', 'Vanille'];

function getTiers(category: string): PriceTier[] | null {
  if (category === 'Cookies') return COOKIE_TIERS;
  if (category === 'Crêpes') return CREPE_TIERS;
  return null;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [flavorPicks, setFlavorPicks] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData.filter(p => p.available));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedTier(null);
    setFlavorPicks({});
    setQuantity(1);
    setAdded(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setAdded(false);
  };

  // When a tier is selected, pre-fill the clicked product with full qty
  const handleSelectTier = (tier: PriceTier) => {
    setSelectedTier(tier);
    setAdded(false);
    if (!tier.custom && selectedProduct) {
      if (selectedProduct.category === 'Cookies') {
        setFlavorPicks({ [selectedProduct.name]: tier.qty });
      } else if (selectedProduct.category === 'Crêpes') {
        setFlavorPicks({ [CREPE_FLAVORS[0]]: tier.qty });
      }
    }
  };

  const totalPicked = Object.values(flavorPicks).reduce((s, v) => s + v, 0);
  const remaining = (selectedTier?.qty ?? 0) - totalPicked;

  const adjustFlavor = (name: string, delta: number) => {
    setFlavorPicks(prev => {
      const current = prev[name] ?? 0;
      const next = Math.max(0, current + delta);
      if (delta > 0 && remaining <= 0) return prev;
      return { ...prev, [name]: next };
    });
  };

  const flavorSummary = () =>
    Object.entries(flavorPicks)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ');

  const canAddToCart = selectedTier && !selectedTier.custom && remaining === 0;

  const doAddToCart = (goToCart = false) => {
    if (!selectedProduct || !selectedTier) return;
    const summary = flavorSummary();
    const name = selectedTier.qty === 1
      ? selectedProduct.name
      : `${selectedProduct.category === 'Cookies' ? '🍪' : '🥞'} ${selectedTier.label}`;
    addToCart({
      type: 'promotion' as const,
      name,
      price: selectedTier.price,
      quantity: 1,
      description: summary || (selectedProduct.flavor || selectedProduct.description),
    });
    if (goToCart) { closeModal(); navigate('/cart'); }
    else setAdded(true);
  };

  // Flavor options depending on category
  const flavorOptions = selectedProduct?.category === 'Cookies'
    ? products.filter(p => p.category === 'Cookies').map(p => p.name)
    : selectedProduct?.category === 'Crêpes'
    ? CREPE_FLAVORS
    : [];

  const categories = ['all', 'Cookies', 'Crêpes', 'Gâteaux'];
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (loading) return <div className="loading">Chargement des produits...</div>;

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>🍰 Nos Produits</h1>
        <p>Découvrez toutes nos délicieuses créations artisanales</p>
      </div>

      <div className="products-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>Aucun produit disponible dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => openModal(product)} style={{ cursor: 'pointer' }}>
              {product.imageUrl && (
                <div className="product-image">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
              )}
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3>{product.name}</h3>
                {product.flavor && <div className="product-flavor">🍫 {product.flavor}</div>}
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2)} $</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pricing-info">
        <h2>💰 Informations de Vente</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>🍪 Cookies</h3>
            <ul>
              <li>Cookie à l'unité : <strong>6,00 $</strong></li>
              <li>Boîte de 4 : <strong>20,00 $</strong></li>
              <li>Boîte de 6 : <strong>25,00 $</strong></li>
              <li>Boîte de 12 : <strong>45,00 $</strong></li>
              <li>Boîte de 24 : <strong>85,00 $</strong></li>
              <li>Autre quantité : <strong>prix sur demande</strong></li>
            </ul>
            <p className="pricing-note">⚠️ Les saveurs spéciales doivent être confirmées à l'avance</p>
          </div>
          <div className="pricing-card">
            <h3>🥞 Crêpes</h3>
            <ul>
              <li>13 crêpes : <strong>20,00 $</strong></li>
              <li>30 crêpes : <strong>40,00 $</strong></li>
              <li>45 crêpes : <strong>60,00 $</strong></li>
              <li>60 crêpes : <strong>70,00 $</strong></li>
              <li>Autre quantité : <strong>prix sur demande</strong></li>
            </ul>
            <p className="pricing-note">⚠️ Les saveurs spéciales doivent être confirmées à l'avance</p>
          </div>
          <div className="pricing-card">
            <h3>🎂 Gâteaux</h3>
            <p><strong>Vendus à l'unité</strong></p>
            <ul>
              <li>Gâteau personnalisé sur mesure</li>
              <li>Prix selon taille et design</li>
              <li>Contactez-nous pour un devis</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={e => e.stopPropagation()}>
            <button className="checkout-close" onClick={closeModal}>✕</button>

            {selectedProduct.imageUrl && (
              <img className="product-modal-img" src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            )}

            <div className="product-modal-body">
              <div className="product-category">{selectedProduct.category}</div>
              <h2>{selectedProduct.name}</h2>
              {selectedProduct.flavor && <div className="product-flavor">🍫 {selectedProduct.flavor}</div>}
              <p className="product-modal-desc">{selectedProduct.description}</p>
              <div className="product-modal-price">{selectedProduct.price.toFixed(2)} $ / unité</div>

              {/* Tier selection */}
              {getTiers(selectedProduct.category) && (
                <div className="tier-selector">
                  <label>Choisir une quantité</label>
                  <div className="tier-grid">
                    {getTiers(selectedProduct.category)!.map(tier => (
                      <button
                        key={tier.label}
                        className={`tier-btn${selectedTier?.label === tier.label ? ' selected' : ''}${tier.custom ? ' tier-custom' : ''}`}
                        onClick={() => handleSelectTier(tier)}
                      >
                        <span className="tier-label">{tier.label}</span>
                        {!tier.custom && <span className="tier-price">{tier.price.toFixed(2)} $</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor picker — shown once a non-custom tier is selected */}
              {selectedTier && !selectedTier.custom && flavorOptions.length > 0 && (
                <div className="flavor-picker">
                  <div className="flavor-picker-header">
                    <label>Choisir les saveurs</label>
                    <span className={`flavor-counter ${remaining === 0 ? 'done' : ''}`}>
                      {totalPicked} / {selectedTier.qty}
                    </span>
                  </div>
                  <div className="flavor-list">
                    {flavorOptions.map(name => (
                      <div key={name} className="flavor-row">
                        <span className="flavor-name">{name}</span>
                        <div className="flavor-controls">
                          <button className="btn-quantity" onClick={() => adjustFlavor(name, -1)} disabled={(flavorPicks[name] ?? 0) === 0}>−</button>
                          <span className="flavor-qty">{flavorPicks[name] ?? 0}</span>
                          <button className="btn-quantity" onClick={() => adjustFlavor(name, 1)} disabled={remaining === 0}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {remaining > 0 && (
                    <p className="flavor-remaining">Il reste <strong>{remaining}</strong> {selectedProduct.category === 'Cookies' ? 'cookie(s)' : 'crêpe(s)'} à choisir</p>
                  )}
                  {remaining === 0 && (
                    <p className="flavor-summary">✅ {flavorSummary()}</p>
                  )}
                  {selectedTier && !selectedTier.custom && (
                    <div className="tier-total">Total : <strong>{selectedTier.price.toFixed(2)} $</strong></div>
                  )}
                </div>
              )}

              {selectedTier?.custom && (
                <p className="tier-custom-note">📞 Contactez-nous pour un devis personnalisé.</p>
              )}

              {/* Actions */}
              {added ? (
                <div className="product-modal-added">
                  <p className="success-message">✅ Ajouté au panier !</p>
                  <div className="product-modal-actions">
                    <button className="btn btn-secondary" onClick={closeModal}>Continuer mes achats</button>
                    <button className="btn btn-primary" onClick={() => { closeModal(); navigate('/cart'); }}>Voir le panier</button>
                  </div>
                </div>
              ) : selectedTier?.custom ? (
                <div className="product-modal-actions">
                  <button className="btn btn-primary" onClick={() => { closeModal(); navigate('/contact'); }}>Nous contacter</button>
                </div>
              ) : (
                <div className="product-modal-actions">
                  <button className="btn btn-secondary" onClick={() => doAddToCart(false)} disabled={!canAddToCart}>
                    🛒 Ajouter au panier
                  </button>
                  <button className="btn btn-primary" onClick={() => doAddToCart(true)} disabled={!canAddToCart}>
                    ⚡ Payer maintenant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
