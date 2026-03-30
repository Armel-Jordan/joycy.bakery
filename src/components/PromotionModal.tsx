import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

interface Promotion {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  price: number;
  description: string;
  description_en?: string;
  badge?: string;
  badge_en?: string;
  savings?: string;
  savings_en?: string;
  imageUrl?: string;
  featured: boolean;
  available: boolean;
}

interface Props {
  promotion: Promotion;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Cookies: '🍪',
  Crêpes: '🥞',
  Gâteaux: '🎂',
  Autres: '✨',
};

export default function PromotionModal({ promotion, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const loc = (field: 'name' | 'description' | 'badge' | 'savings') => {
    if (i18n.language === 'en') {
      const v = promotion[`${field}_en` as keyof Promotion] as string | undefined;
      if (v) return v;
    }
    return promotion[field] || '';
  };

  const handleAdd = () => {
    addToCart({
      type: 'promotion',
      name: loc('name'),
      price: promotion.price,
      quantity: 1,
      description: loc('description'),
    });
    setAdded(true);
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>✕</button>

        {promotion.imageUrl ? (
          <img className="product-modal-img" src={promotion.imageUrl} alt={loc('name')} />
        ) : (
          <div className="product-modal-img-placeholder">
            {CATEGORY_ICONS[promotion.category] || '🎉'}
          </div>
        )}

        <div className="product-modal-body">
          {loc('badge') && (
            <div className={`promo-badge${loc('badge').toLowerCase().includes('populaire') || loc('badge').toLowerCase().includes('popular') || loc('badge').toLowerCase().includes('valeur') || loc('badge').toLowerCase().includes('value') ? ' popular' : ''}`} style={{ marginBottom: '0.75rem' }}>
              {loc('badge')}
            </div>
          )}

          <div className="product-category">
            {CATEGORY_ICONS[promotion.category]} {promotion.category}
          </div>
          <h2>{loc('name')}</h2>
          <p className="product-modal-desc">{loc('description')}</p>

          <div className="promo-price" style={{ margin: '1rem 0' }}>
            <span className="price-main" style={{ fontSize: '1.6rem' }}>
              {promotion.price.toFixed(2).replace('.', ',')} $
            </span>
          </div>

          {loc('savings') && (
            <div className="savings">{loc('savings')}</div>
          )}

          {added ? (
            <div className="product-modal-added">
              <p className="success-message">{t('promotions.added')}</p>
              <div className="product-modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>{t('products.continueShopping')}</button>
                <button className="btn btn-primary" onClick={() => { onClose(); window.location.href = '/cart'; }}>{t('products.viewCart')}</button>
              </div>
            </div>
          ) : (
            <div className="product-modal-actions">
              <button className="btn btn-primary btn-large" onClick={handleAdd}>
                {t('promotions.addToCart')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
