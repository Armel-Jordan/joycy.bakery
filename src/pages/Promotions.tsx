import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';

interface Promotion {
  id: string;
  name: string;
  category: 'Cookies' | 'Crêpes' | 'Gâteaux' | 'Autres';
  price: number;
  description: string;
  badge?: string;
  savings?: string;
  imageUrl?: string;
  featured: boolean;
  available: boolean;
}

const CATEGORIES = [
  { key: 'all',     icon: '🎉', label: 'Toutes'  },
  { key: 'Cookies', icon: '🍪', label: 'Cookies'  },
  { key: 'Crêpes',  icon: '🥞', label: 'Crêpes'   },
  { key: 'Gâteaux', icon: '🎂', label: 'Gâteaux'  },
  { key: 'Autres',  icon: '✨', label: 'Autres'    },
];

export default function Promotions() {
  const { addToCart } = useCart();
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

  // Featured first, then rest
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="promotions-page">
      <div className="promotions-hero">
        <h1>🎉 Promotions & Offres Spéciales</h1>
        <p>Profitez de nos offres avantageuses sur nos produits</p>
      </div>

      <div className="promotions-content">
        {loading ? (
          <div className="loading">Chargement des promotions...</div>
        ) : promotions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
            Aucune promotion disponible pour le moment.
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
                  <span>{c.label}</span>
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
                    <div className={`promo-badge${p.badge.toLowerCase().includes('populaire') || p.badge.toLowerCase().includes('valeur') ? ' popular' : ''}`}>
                      {p.badge}
                    </div>
                  )}
                  {p.imageUrl && (
                    <div className="promo-card-img">
                      <img src={p.imageUrl} alt={p.name} />
                    </div>
                  )}
                  <div className="promo-card-cat">{
                    CATEGORIES.find(c => c.key === p.category)?.icon
                  } {p.category}</div>
                  <h3>{p.name}</h3>
                  <div className="promo-price">
                    <span className="price-main">{p.price.toFixed(2).replace('.', ',')} $</span>
                  </div>
                  <p>{p.description}</p>
                  {p.savings && <div className="savings">{p.savings}</div>}
                  <button
                    className={`btn btn-add-cart${added === p.id ? ' btn-added' : ''}`}
                    onClick={() => handleAddToCart(p)}
                    disabled={added === p.id}
                  >
                    {added === p.id ? '✅ Ajouté !' : '🛒 Ajouter au panier'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="delivery-info">
          <h2>🚚 Options de Livraison</h2>
          <div className="delivery-options">
            <div className="delivery-option">
              <div className="delivery-icon">📍</div>
              <div className="delivery-details">
                <h3>Ramassage Gratuit (Pick-up)</h3>
                <p>À Québec City — Gratuit</p>
              </div>
            </div>
            <div className="delivery-option">
              <div className="delivery-icon">🚗</div>
              <div className="delivery-details">
                <h3>Livraison à Domicile</h3>
                <p>Dans la ville de Québec — 10,00 $</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
