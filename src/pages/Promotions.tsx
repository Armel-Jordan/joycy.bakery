import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

interface Promotion {
  id: string;
  name: string;
  name_en?: string;
  category: 'Cookies' | 'Crêpes' | 'Gâteaux' | 'Autres';
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

const CATEGORIES = [
  { key: 'all',     icon: '🎉', labelKey: 'promotions.tabs.all' },
  { key: 'Cookies', icon: '🍪', label: 'Cookies'  },
  { key: 'Crêpes',  icon: '🥞', label: 'Crêpes'   },
  { key: 'Gâteaux', icon: '🎂', label: 'Gâteaux'  },
  { key: 'Autres',  icon: '✨', label: 'Autres'    },
];

export default function Promotions() {
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();

  const loc = (p: Promotion, field: 'name' | 'description' | 'badge' | 'savings') => {
    if (i18n.language === 'en') {
      const enVal = p[`${field}_en` as keyof Promotion] as string | undefined;
      if (enVal) return enVal;
    }
    return p[field] || '';
  };
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'promotions'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
        setPromotions(all.filter(p => p.available));
      } catch {
        console.error('Erreur chargement promotions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = (p: Promotion) => {
    addToCart({ type: 'promotion', name: p.name, price: p.price, quantity: 1, description: p.description });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 2000);
  };

  const visibleTabs = CATEGORIES.filter(c =>
    c.key === 'all' || promotions.some(p => p.category === c.key)
  );

  const filtered = activeTab === 'all'
    ? promotions
    : promotions.filter(p => p.category === activeTab);

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="promotions-page">
      <div className="promotions-hero">
        <h1>{t('promotions.hero.title')}</h1>
        <p>{t('promotions.hero.desc')}</p>
      </div>

      <div className="promotions-content">
        {loading ? (
          <div className="loading">{t('promotions.loading')}</div>
        ) : promotions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
            {t('promotions.none')}
          </p>
        ) : (
          <>
            {/* Onglets catégorie */}
            <div className="promo-tabs">
              {visibleTabs.map(c => (
                <button
                  key={c.key}
                  className={`promo-tab${activeTab === c.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(c.key)}
                >
                  <span>{c.icon}</span>
                  <span>{'labelKey' in c ? t(c.labelKey as any) : c.label}</span>
                  {c.key !== 'all' && (
                    <span className="promo-tab-count">
                      {promotions.filter(p => p.category === c.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Grille promotions */}
            <div className="promo-grid">
              {sorted.map(p => (
                <div key={p.id} className={`promo-card${p.featured ? ' featured' : ''}`}>
                  {p.badge && (
                    <div className={`promo-badge${loc(p, 'badge').toLowerCase().includes('populaire') || loc(p, 'badge').toLowerCase().includes('valeur') || loc(p, 'badge').toLowerCase().includes('popular') || loc(p, 'badge').toLowerCase().includes('value') ? ' popular' : ''}`}>
                      {loc(p, 'badge')}
                    </div>
                  )}
                  {p.imageUrl && (
                    <div className="promo-card-img">
                      <img src={p.imageUrl} alt={loc(p, 'name')} />
                    </div>
                  )}
                  <div className="promo-card-cat">{
                    CATEGORIES.find(c => c.key === p.category)?.icon
                  } {p.category}</div>
                  <h3>{loc(p, 'name')}</h3>
                  <div className="promo-price">
                    <span className="price-main">{p.price.toFixed(2).replace('.', ',')} $</span>
                  </div>
                  <p>{loc(p, 'description')}</p>
                  {p.savings && <div className="savings">{loc(p, 'savings')}</div>}
                  <button
                    className={`btn btn-add-cart${added === p.id ? ' btn-added' : ''}`}
                    onClick={() => handleAddToCart(p)}
                    disabled={added === p.id}
                  >
                    {added === p.id ? t('promotions.added') : t('promotions.addToCart')}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="delivery-info">
          <h2>{t('promotions.delivery.title')}</h2>
          <div className="delivery-options">
            <div className="delivery-option">
              <div className="delivery-icon">📍</div>
              <div className="delivery-details">
                <h3>{t('promotions.delivery.pickup.title')}</h3>
                <p>{t('promotions.delivery.pickup.desc')}</p>
              </div>
            </div>
            <div className="delivery-option">
              <div className="delivery-icon">🚗</div>
              <div className="delivery-details">
                <h3>{t('promotions.delivery.home.title')}</h3>
                <p>{t('promotions.delivery.home.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
