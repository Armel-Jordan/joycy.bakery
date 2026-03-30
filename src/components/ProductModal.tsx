import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

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

interface Props {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
}

export default function ProductModal({ product, allProducts, onClose }: Props) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [flavorPicks, setFlavorPicks] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const loc = (p: Product, field: 'name' | 'description' | 'flavor') => {
    if (i18n.language === 'en') {
      const v = p[`${field}_en` as keyof Product] as string | undefined;
      if (v) return v;
    }
    return p[field] || '';
  };

  const handleSelectTier = (tier: PriceTier) => {
    setSelectedTier(tier);
    setAdded(false);
    if (!tier.custom) {
      if (product.category === 'Cookies') {
        setFlavorPicks({ [product.name]: tier.qty });
      } else if (product.category === 'Crêpes') {
        const first = allProducts.filter(p => p.category === 'Crêpes')[0]?.name;
        if (first) setFlavorPicks({ [first]: tier.qty });
      }
    }
  };

  const totalPicked = Object.values(flavorPicks).reduce((s, v) => s + v, 0);
  const remaining = (selectedTier?.qty ?? 0) - totalPicked;
  const MIN_CREPE = 7;

  const adjustFlavor = (name: string, delta: number) => {
    const isCrepe = product.category === 'Crêpes';
    const min = isCrepe ? MIN_CREPE : 1;
    setFlavorPicks(prev => {
      const current = prev[name] ?? 0;
      if (delta > 0) {
        if (remaining <= 0) return prev;
        if (current === 0 && isCrepe) return { ...prev, [name]: Math.min(min, remaining) };
        return { ...prev, [name]: current + 1 };
      } else {
        if (current <= min && isCrepe) return { ...prev, [name]: 0 };
        return { ...prev, [name]: Math.max(0, current - 1) };
      }
    });
  };

  const flavorSummary = () =>
    Object.entries(flavorPicks).filter(([, q]) => q > 0).map(([n, q]) => `${q}x ${n}`).join(', ');

  const canAddToCart = selectedTier && !selectedTier.custom && remaining === 0;

  const doAddToCart = (goToCart = false) => {
    if (!selectedTier) return;
    const summary = flavorSummary();
    const name = selectedTier.qty === 1
      ? loc(product, 'name')
      : `${product.category === 'Cookies' ? '🍪' : '🥞'} ${selectedTier.label}`;
    addToCart({
      type: 'promotion' as const,
      name,
      price: selectedTier.price,
      quantity: 1,
      description: summary || (loc(product, 'flavor') || loc(product, 'description')),
    });
    if (goToCart) { onClose(); navigate('/cart'); }
    else setAdded(true);
  };

  const flavorOptions = product.category === 'Cookies'
    ? allProducts.filter(p => p.category === 'Cookies').map(p => p.name)
    : product.category === 'Crêpes'
    ? allProducts.filter(p => p.category === 'Crêpes').map(p => p.name)
    : [];

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>✕</button>

        {product.imageUrl && (
          <img className="product-modal-img" src={product.imageUrl} alt={loc(product, 'name')} />
        )}

        <div className="product-modal-body">
          <div className="product-category">{product.category}</div>
          <h2>{loc(product, 'name')}</h2>
          {product.flavor && <div className="product-flavor">🍫 {loc(product, 'flavor')}</div>}
          <p className="product-modal-desc">{loc(product, 'description')}</p>
          <div className="product-modal-price">{product.price.toFixed(2)} {t('products.perUnit')}</div>

          {getTiers(product.category) && (
            <div className="tier-selector">
              <label>{t('products.chooseQty')}</label>
              <div className="tier-grid">
                {getTiers(product.category)!.map(tier => (
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
                  {product.category === 'Crêpes' && <small> ({t('products.minPerFlavor')})</small>}
                </label>
                <span className={`flavor-counter${remaining === 0 ? ' done' : ''}`}>
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
                  {product.category === 'Cookies'
                    ? t(remaining === 1 ? 'products.remaining_one' : 'products.remaining_other', { count: remaining })
                    : t(remaining === 1 ? 'products.remainingCrepe_one' : 'products.remainingCrepe_other', { count: remaining })
                  }
                </p>
              )}
              {remaining === 0 && <p className="flavor-summary">✅ {flavorSummary()}</p>}
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
                <button className="btn btn-secondary" onClick={onClose}>{t('products.continueShopping')}</button>
                <button className="btn btn-primary" onClick={() => { onClose(); navigate('/cart'); }}>{t('products.viewCart')}</button>
              </div>
            </div>
          ) : selectedTier?.custom ? (
            <div className="product-modal-actions">
              <button className="btn btn-primary" onClick={() => { onClose(); navigate('/contact'); }}>{t('products.contactUs')}</button>
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
  );
}
