import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

interface HomeProps {
  user: User | null;
}

export default function Home({ user: _user }: HomeProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-home">
        <div className="hero-content">
          <img src="/logo.png" alt="Joycy Bakery Logo" className="hero-logo" />
          <h1>Joycy Bakery</h1>
          <p className="hero-subtitle">{t('home.hero.subtitle')}</p>
          <p className="hero-description">{t('home.hero.description')}</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/promotions')} className="btn-hero-primary">
              {t('home.hero.seePromotions')}
            </button>
            <button onClick={() => navigate('/personnalisation')} className="btn-hero-secondary">
              {t('home.hero.createOrder')}
            </button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="home-specialties">
        <h2>{t('home.specialties.title')}</h2>
        <div className="specialties-cards">
          <div className="specialty-home-card" onClick={() => navigate('/promotions')}>
            <div className="specialty-icon-large">🍪</div>
            <h3>{t('home.specialties.cookies.name')}</h3>
            <p>{t('home.specialties.cookies.desc')}</p>
            <p className="specialty-price">{t('home.specialties.cookies.price')}</p>
          </div>
          <div className="specialty-home-card" onClick={() => navigate('/promotions')}>
            <div className="specialty-icon-large">🥞</div>
            <h3>{t('home.specialties.crepes.name')}</h3>
            <p>{t('home.specialties.crepes.desc')}</p>
            <p className="specialty-price">{t('home.specialties.crepes.price')}</p>
          </div>
          <div className="specialty-home-card" onClick={() => navigate('/personnalisation')}>
            <div className="specialty-icon-large">🎂</div>
            <h3>{t('home.specialties.cakes.name')}</h3>
            <p>{t('home.specialties.cakes.desc')}</p>
            <p className="specialty-price">{t('home.specialties.cakes.price')}</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="home-why">
        <h2>{t('home.why.title')}</h2>
        <div className="why-grid">
          <div className="why-item">
            <div className="why-icon">✨</div>
            <h3>{t('home.why.unique.title')}</h3>
            <p>{t('home.why.unique.desc')}</p>
          </div>
          <div className="why-item">
            <div className="why-icon">🎨</div>
            <h3>{t('home.why.custom.title')}</h3>
            <p>{t('home.why.custom.desc')}</p>
          </div>
          <div className="why-item">
            <div className="why-icon">❤️</div>
            <h3>{t('home.why.passion.title')}</h3>
            <p>{t('home.why.passion.desc')}</p>
          </div>
          <div className="why-item">
            <div className="why-icon">📍</div>
            <h3>{t('home.why.local.title')}</h3>
            <p>{t('home.why.local.desc')}</p>
          </div>
        </div>
      </section>

      {/* Featured Promotions */}
      <section className="home-promos">
        <h2>{t('home.promos.title')}</h2>
        <div className="promo-highlight-grid">
          <div className="promo-highlight">
            <div className="promo-badge-home">{t('home.promos.popular')}</div>
            <h3>{t('home.promos.box6')}</h3>
            <p className="promo-price-home">20,00 $</p>
            <p>{t('home.promos.box6Desc')}</p>
            <button onClick={() => navigate('/promotions')} className="btn-promo">
              {t('home.promos.order')}
            </button>
          </div>
          <div className="promo-highlight">
            <div className="promo-badge-home">{t('home.promos.bestValue')}</div>
            <h3>{t('home.promos.crepes30')}</h3>
            <p className="promo-price-home">40,00 $</p>
            <p>{t('home.promos.crepes30Desc')}</p>
            <button onClick={() => navigate('/promotions')} className="btn-promo">
              {t('home.promos.order')}
            </button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="home-about">
        <div className="about-content">
          <h2>{t('home.about.title')}</h2>
          <p>{t('home.about.text')}</p>
          <button onClick={() => navigate('/bio')} className="btn-learn-more">
            {t('home.about.learnMore')}
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <h2>{t('home.cta.title')}</h2>
        <p>{t('home.cta.desc')}</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/promotions')} className="btn-cta-primary">
            {t('home.cta.seePromos')}
          </button>
          <button onClick={() => navigate('/personnalisation')} className="btn-cta-secondary">
            {t('home.cta.customize')}
          </button>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="home-delivery">
        <h3>{t('home.delivery.title')}</h3>
        <div className="delivery-options-home">
          <div className="delivery-option-home">
            <span className="delivery-icon-home">📍</span>
            <span>{t('home.delivery.pickup')}</span>
          </div>
          <div className="delivery-option-home">
            <span className="delivery-icon-home">🚗</span>
            <span>{t('home.delivery.home')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
