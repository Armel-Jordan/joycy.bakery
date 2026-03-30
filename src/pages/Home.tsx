import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductModal from '../components/ProductModal';
import PromotionModal from '../components/PromotionModal';

interface Promotion {
  id: string;
  name: string;
  name_en?: string;
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
  category: string;
}

interface HomeProps {
  user: User | null;
}

export default function Home({ user: _user }: HomeProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [homePromos, setHomePromos] = useState<Promotion[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
        .filter(p => p.available);
      setAllProducts(all);
      const picked: Product[] = [];
      ['Cookies', 'Crêpes', 'Gâteaux'].forEach(cat => {
        const p = all.find(x => x.category === cat);
        if (p) picked.push(p);
      });
      all.filter(p => !picked.find(x => x.id === p.id)).forEach(p => {
        if (picked.length < 4) picked.push(p);
      });
      setFeaturedProducts(picked.slice(0, 4));
    }).catch(() => {});

    getDocs(collection(db, 'promotions')).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion))
        .filter(p => p.available);
      const featured = all.filter(p => p.featured);
      setHomePromos(featured.length > 0 ? featured : all);
    }).catch(() => {});
  }, []);

  const loc = (p: Product, field: 'name' | 'description' | 'flavor') => {
    if (i18n.language === 'en') {
      const v = p[`${field}_en` as keyof Product] as string | undefined;
      if (v) return v;
    }
    return p[field] || '';
  };

  const locPromo = (p: Promotion, field: 'name' | 'description' | 'badge' | 'savings') => {
    if (i18n.language === 'en') {
      const v = p[`${field}_en` as keyof Promotion] as string | undefined;
      if (v) return v;
    }
    return p[field] || '';
  };

  const categoryIcon = (cat: string) =>
    cat === 'Cookies' ? '🍪' : cat === 'Crêpes' ? '🥞' : cat === 'Gâteaux' ? '🎂' : '✨';

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <img src="/logo.png" alt="Joycy Bakery" className="home-hero-logo" />
          <p className="home-hero-tag">{t('home.hero.subtitle')}</p>
          <h1 className="home-hero-title">Joycy Bakery</h1>
          <p className="home-hero-desc">{t('home.hero.description')}</p>
          <div className="home-hero-actions">
            <button className="home-btn-primary" onClick={() => navigate('/produits')}>
              {t('home.hero.seeProducts')}
            </button>
            <button className="home-btn-ghost" onClick={() => navigate('/personnalisation')}>
              {t('home.hero.createOrder')}
            </button>
          </div>
        </div>
        <div className="home-hero-strip">
          <span>📍 {t('home.delivery.pickup')}</span>
          <span className="strip-dot">·</span>
          <span>🚗 {t('home.delivery.home')}</span>
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      <section className="home-cats">
        <div className="home-cats-grid">
          <div className="home-cat-card" onClick={() => navigate('/produits')}>
            <div className="home-cat-icon">🍪</div>
            <div className="home-cat-body">
              <h3>{t('home.specialties.cookies.name')}</h3>
              <p>{t('home.specialties.cookies.desc')}</p>
              <span className="home-cat-price">{t('home.specialties.cookies.price')}</span>
            </div>
            <span className="home-cat-arrow">→</span>
          </div>
          <div className="home-cat-card" onClick={() => navigate('/produits')}>
            <div className="home-cat-icon">🥞</div>
            <div className="home-cat-body">
              <h3>{t('home.specialties.crepes.name')}</h3>
              <p>{t('home.specialties.crepes.desc')}</p>
              <span className="home-cat-price">{t('home.specialties.crepes.price')}</span>
            </div>
            <span className="home-cat-arrow">→</span>
          </div>
          <div className="home-cat-card" onClick={() => navigate('/personnalisation')}>
            <div className="home-cat-icon">🎂</div>
            <div className="home-cat-body">
              <h3>{t('home.specialties.cakes.name')}</h3>
              <p>{t('home.specialties.cakes.desc')}</p>
              <span className="home-cat-price">{t('home.specialties.cakes.price')}</span>
            </div>
            <span className="home-cat-arrow">→</span>
          </div>
        </div>
      </section>

      {/* ── PRODUITS VEDETTES ── */}
      {featuredProducts.length > 0 && (
        <section className="home-featured">
          <div className="home-section-header">
            <span className="home-section-label">{t('home.featuredProducts.title')}</span>
            <div className="home-section-line" />
          </div>
          <div className="home-featured-grid">
            {featuredProducts.map(p => (
              <div
                key={p.id}
                className="home-prod-card"
                onClick={() => setSelectedProduct(p)}
              >
                {p.imageUrl ? (
                  <div className="home-prod-img">
                    <img src={p.imageUrl} alt={loc(p, 'name')} />
                  </div>
                ) : (
                  <div className="home-prod-img home-prod-img--empty">
                    {categoryIcon(p.category)}
                  </div>
                )}
                <div className="home-prod-info">
                  <span className="home-prod-cat">{categoryIcon(p.category)} {p.category}</span>
                  <h3>{loc(p, 'name')}</h3>
                  {p.flavor && <p className="home-prod-flavor">🍫 {loc(p, 'flavor')}</p>}
                  <p className="home-prod-desc">{loc(p, 'description')}</p>
                  <span className="home-prod-price">{p.price.toFixed(2)} $</span>
                </div>
              </div>
            ))}
          </div>
          <div className="home-see-more-wrap">
            <button className="home-btn-outline" onClick={() => navigate('/produits')}>
              {t('home.featuredProducts.seeMore')}
            </button>
          </div>
        </section>
      )}

      {/* ── PROMOTIONS CARROUSEL ── */}
      {homePromos.length > 0 && (
        <section className="home-promos-section">
          <div className="home-section-header">
            <span className="home-section-label">{t('home.promos.title')}</span>
            <div className="home-section-line" />
          </div>

          <div className="promo-carousel">
            {homePromos.length > 1 && (
              <button
                className="promo-carousel-arrow promo-carousel-arrow--prev"
                onClick={() => setPromoIndex(i => (i - 1 + homePromos.length) % homePromos.length)}
              >
                ‹
              </button>
            )}

            <div className="promo-carousel-track">
              <div
                className="promo-carousel-inner"
                style={{ transform: `translateX(-${promoIndex * 100}%)` }}
              >
                {homePromos.map((p, i) => (
                  <div key={p.id} className="promo-carousel-slide">
                    <div className="home-promo-card">
                      {locPromo(p, 'badge') && (
                        <div className={`home-promo-badge${i % 2 === 1 ? ' home-promo-badge--gold' : ''}`}>
                          {locPromo(p, 'badge')}
                        </div>
                      )}
                      <div className="home-promo-icon">
                        {p.category === 'Cookies' ? '🍪' : p.category === 'Crêpes' ? '🥞' : p.category === 'Gâteaux' ? '🎂' : '🎉'}
                      </div>
                      <h3>{locPromo(p, 'name')}</h3>
                      <p className="home-promo-price">{p.price.toFixed(2).replace('.', ',')} $</p>
                      {locPromo(p, 'savings') && <p className="home-promo-desc">{locPromo(p, 'savings')}</p>}
                      {!locPromo(p, 'savings') && locPromo(p, 'description') && (
                        <p className="home-promo-desc">{locPromo(p, 'description')}</p>
                      )}
                      <button className="home-btn-primary" onClick={() => setSelectedPromo(p)}>
                        {t('home.promos.order')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {homePromos.length > 1 && (
              <button
                className="promo-carousel-arrow promo-carousel-arrow--next"
                onClick={() => setPromoIndex(i => (i + 1) % homePromos.length)}
              >
                ›
              </button>
            )}
          </div>

          {homePromos.length > 1 && (
            <div className="promo-carousel-dots">
              {homePromos.map((_, i) => (
                <button
                  key={i}
                  className={`promo-carousel-dot${i === promoIndex ? ' active' : ''}`}
                  onClick={() => setPromoIndex(i)}
                />
              ))}
            </div>
          )}

          <div className="home-see-more-wrap" style={{ marginTop: '2rem' }}>
            <button className="home-btn-outline" onClick={() => navigate('/promotions')}>
              {t('home.promos.seeAll')} →
            </button>
          </div>
        </section>
      )}

      {/* ── POURQUOI NOUS ── */}
      <section className="home-values">
        <div className="home-section-header">
          <span className="home-section-label">{t('home.why.title')}</span>
          <div className="home-section-line" />
        </div>
        <div className="home-values-grid">
          <div className="home-value-item">
            <span className="home-value-icon">✨</span>
            <h4>{t('home.why.unique.title')}</h4>
            <p>{t('home.why.unique.desc')}</p>
          </div>
          <div className="home-value-item">
            <span className="home-value-icon">🎨</span>
            <h4>{t('home.why.custom.title')}</h4>
            <p>{t('home.why.custom.desc')}</p>
          </div>
          <div className="home-value-item">
            <span className="home-value-icon">❤️</span>
            <h4>{t('home.why.passion.title')}</h4>
            <p>{t('home.why.passion.desc')}</p>
          </div>
          <div className="home-value-item">
            <span className="home-value-icon">📍</span>
            <h4>{t('home.why.local.title')}</h4>
            <p>{t('home.why.local.desc')}</p>
          </div>
        </div>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="home-about-teaser">
        <div className="home-about-inner">
          <span className="home-about-emoji">👩‍🍳</span>
          <h2>{t('home.about.title')}</h2>
          <p>{t('home.about.text')}</p>
          <button className="home-btn-ghost" onClick={() => navigate('/bio')}>
            {t('home.about.learnMore')} →
          </button>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="home-cta-band">
        <h2>{t('home.cta.title')}</h2>
        <p>{t('home.cta.desc')}</p>
        <div className="home-cta-actions">
          <button className="home-btn-white" onClick={() => navigate('/produits')}>
            {t('home.cta.seeProducts')}
          </button>
          <button className="home-btn-outline-white" onClick={() => navigate('/personnalisation')}>
            {t('home.cta.customize')}
          </button>
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={allProducts}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedPromo && (
        <PromotionModal
          promotion={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}
    </div>
  );
}
