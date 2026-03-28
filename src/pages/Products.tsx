import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

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
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const loc = (product: Product, field: 'name' | 'description' | 'flavor') => {
    if (i18n.language === 'en') {
      const enVal = product[`${field}_en` as keyof Product] as string | undefined;
      if (enVal) return enVal;
    }
    return product[field] || '';
  };

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
    setAdded(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setAdded(false);
  };

  const handleSelectTier = (tier: PriceTier) => {
    setSelectedTier(tier);
    setAdded(false);
    if (!tier.custom && selectedProduct) {
      if (selectedProduct.category === 'Cookies') {
        setFlavorPicks({ [selectedProduct.name]: tier.qty });
      } else if (selectedProduct.category === 'Crêpes') {
        const firstFlavor = products.filter(p => p.category === 'Crêpes')[0]?.name;
        if (firstFlavor) setFlavorPicks({ [firstFlavor]: tier.qty });
      }
    }
  };

  const totalPicked = Object.values(flavorPicks).reduce((s, v) => s + v, 0);
  const remaining = (selectedTier?.qty ?? 0) - totalPicked;

  const MIN_CREPE_PER_FLAVOR = 7;

  const adjustFlavor = (name: string, delta: number) => {
    if (!selectedProduct) return;
    const isCrepe = selectedProduct.category === 'Crêpes';
    const min = isCrepe ? MIN_CREPE_PER_FLAVOR : 1;

    setFlavorPicks(prev => {
      const current = prev[name] ?? 0;

      if (delta > 0) {
        if (remaining <= 0) return prev;
        if (current === 0 && isCrepe) {
          const jump = Math.min(min, remaining);
          return { ...prev, [name]: jump };
        }
        if (remaining <= 0) return prev;
        return { ...prev, [name]: current + 1 };
      } else {
        if (current <= min && isCrepe) return { ...prev, [name]: 0 };
        return { ...prev, [name]: Math.max(0, current - 1) };
      }
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

  const flavorOptions = selectedProduct?.category === 'Cookies'
    ? products.filter(p => p.category === 'Cookies').map(p => p.name)
    : selectedProduct?.category === 'Crêpes'
    ? products.filter(p => p.category === 'Crêpes').map(p => p.name)
    : [];

  const categories = ['all', 'Cookies', 'Crêpes', 'Gâteaux'];
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (loading) return <div className="loading">{t('products.loading')}</div>;

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>{t('products.hero.title')}</h1>
        <p>{t('products.hero.desc')}</p>
      </div>

      <div className="products-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? t('products.all') : cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>{t('products.empty')}</p>
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
                <h3>{loc(product, 'name')}</h3>
                {product.flavor && <div className="product-flavor">🍫 {loc(product, 'flavor')}</div>}
                <p className="product-description">{loc(product, 'description')}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2)} $</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pricing-info">
        <h2>{t('products.pricing.title')}</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>🍪 Cookies</h3>
            <ul>
              <li>Cookie à l'unité : <strong>6,00 $</strong></li>
              <li>Boîte de 4 : <strong>20,00 $</strong></li>
              <li>Boîte de 6 : <strong>25,00 $</strong></li>
              <li>Boîte de 12 : <strong>45,00 $</strong></li>
              <li>Boîte de 24 : <strong>85,00 $</strong></li>
              <li>Autre quantité : <strong>{t('products.pricing.customPrice')}</strong></li>
            </ul>
            <p className="pricing-note">{t('products.pricing.note')}</p>
          </div>
          <div className="pricing-card">
            <h3>🥞 Crêpes</h3>
            <ul>
              <li>13 crêpes : <strong>20,00 $</strong></li>
              <li>30 crêpes : <strong>40,00 $</strong></li>
              <li>45 crêpes : <strong>60,00 $</strong></li>
              <li>60 crêpes : <strong>70,00 $</strong></li>
              <li>Autre quantité : <strong>{t('products.pricing.customPrice')}</strong></li>
            </ul>
            <p className="pricing-note">{t('products.pricing.note')}</p>
          </div>
          <div className="pricing-card">
            <h3>{t('products.pricing.cakes.title')}</h3>
            <p><strong>{t('products.pricing.soldByUnit')}</strong></p>
            <ul>
              <li>{t('products.pricing.cakes.custom')}</li>
              <li>{t('products.pricing.cakes.price')}</li>
              <li>{t('products.pricing.cakes.contact')}</li>
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
              <h2>{loc(selectedProduct, 'name')}</h2>
              {selectedProduct.flavor && <div className="product-flavor">🍫 {loc(selectedProduct, 'flavor')}</div>}
              <p className="product-modal-desc">{loc(selectedProduct, 'description')}</p>
              <div className="product-modal-price">{selectedProduct.price.toFixed(2)} {t('products.perUnit')}</div>

              {getTiers(selectedProduct.category) && (
                <div className="tier-selector">
                  <label>{t('products.chooseQty')}</label>
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

              {selectedTier && !selectedTier.custom && flavorOptions.length > 0 && (
                <div className="flavor-picker">
                  <div className="flavor-picker-header">
                    <label>
                      {t('products.chooseFlavor')}
                      {selectedProduct.category === 'Crêpes' && <small> ({t('products.minPerFlavor')})</small>}
                    </label>
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
                    <p className="flavor-remaining">
                      {selectedProduct.category === 'Cookies'
                        ? t(remaining === 1 ? 'products.remaining_one' : 'products.remaining_other', { count: remaining })
                        : t(remaining === 1 ? 'products.remainingCrepe_one' : 'products.remainingCrepe_other', { count: remaining })
                      }
                    </p>
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
                <p className="tier-custom-note">{t('products.contactCustom')}</p>
              )}

              {added ? (
                <div className="product-modal-added">
                  <p className="success-message">{t('products.addedToCart')}</p>
                  <div className="product-modal-actions">
                    <button className="btn btn-secondary" onClick={closeModal}>{t('products.continueShopping')}</button>
                    <button className="btn btn-primary" onClick={() => { closeModal(); navigate('/cart'); }}>{t('products.viewCart')}</button>
                  </div>
                </div>
              ) : selectedTier?.custom ? (
                <div className="product-modal-actions">
                  <button className="btn btn-primary" onClick={() => { closeModal(); navigate('/contact'); }}>{t('products.contactUs')}</button>
                </div>
              ) : (
                <div className="product-modal-actions">
                  <button className="btn btn-secondary" onClick={() => doAddToCart(false)} disabled={!canAddToCart}>
                    {t('products.addToCart')}
                  </button>
                  <button className="btn btn-primary" onClick={() => doAddToCart(true)} disabled={!canAddToCart}>
                    {t('products.buyNow')}
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
