import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-home">
        <div className="hero-content">
          <img src="/logo.png" alt="Joycy Bakery Logo" className="hero-logo" />
          <h1>Joycy Bakery</h1>
          <p className="hero-subtitle">De l'art qui se mange, du goût qui reste</p>
          <p className="hero-description">
            Créations artisanales faites avec passion à Québec. 
            Cookies XL, crêpes gourmandes et gâteaux personnalisés pour vos moments spéciaux.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/promotions')} className="btn-hero-primary">
              Voir nos Promotions
            </button>
            <button onClick={() => navigate('/personnalisation')} className="btn-hero-secondary">
              Créer ma Commande
            </button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="home-specialties">
        <h2>Nos Spécialités</h2>
        <div className="specialties-cards">
          <div className="specialty-home-card" onClick={() => navigate('/promotions')}>
            <div className="specialty-icon-large">🍪</div>
            <h3>Cookies XL</h3>
            <p>Irrésistibles et généreux</p>
            <p className="specialty-price">À partir de 4,00 $</p>
          </div>
          <div className="specialty-home-card" onClick={() => navigate('/promotions')}>
            <div className="specialty-icon-large">🥞</div>
            <h3>Crêpes Artisanales</h3>
            <p>Nature, citron ou vanille</p>
            <p className="specialty-price">13 pour 20,00 $</p>
          </div>
          <div className="specialty-home-card" onClick={() => navigate('/personnalisation')}>
            <div className="specialty-icon-large">🎂</div>
            <h3>Cake Design</h3>
            <p>Gâteaux personnalisés sur mesure</p>
            <p className="specialty-price">Sur devis</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="home-why">
        <h2>Pourquoi Joycy Bakery ?</h2>
        <div className="why-grid">
          <div className="why-item">
            <div className="why-icon">✨</div>
            <h3>Créations Uniques</h3>
            <p>Chaque produit est fait avec soin et créativité</p>
          </div>
          <div className="why-item">
            <div className="why-icon">🎨</div>
            <h3>Personnalisation</h3>
            <p>Vos gâteaux sur mesure pour toutes occasions</p>
          </div>
          <div className="why-item">
            <div className="why-icon">❤️</div>
            <h3>Fait avec Passion</h3>
            <p>L'amour de la pâtisserie dans chaque bouchée</p>
          </div>
          <div className="why-item">
            <div className="why-icon">📍</div>
            <h3>Local - Québec</h3>
            <p>Livraison ou ramassage gratuit</p>
          </div>
        </div>
      </section>

      {/* Featured Promotions */}
      <section className="home-promos">
        <h2>Offres du Moment</h2>
        <div className="promo-highlight-grid">
          <div className="promo-highlight">
            <div className="promo-badge-home">Populaire</div>
            <h3>Boîte de 6 Cookies</h3>
            <p className="promo-price-home">20,00 $</p>
            <p>Économisez 4 $ - Parfait pour partager</p>
            <button onClick={() => navigate('/promotions')} className="btn-promo">
              Commander
            </button>
          </div>
          <div className="promo-highlight">
            <div className="promo-badge-home">Meilleure Valeur</div>
            <h3>30 Crêpes</h3>
            <p className="promo-price-home">40,00 $</p>
            <p>Économisez 6 $ - Nature, citron ou vanille</p>
            <button onClick={() => navigate('/promotions')} className="btn-promo">
              Commander
            </button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="home-about">
        <div className="about-content">
          <h2>À Propos</h2>
          <p>
            Étudiante passionnée et créative basée à Québec, je suis la fondatrice de Joycy Bakery. 
            Entrepreneure le jour et pâtissière passionnée la nuit, je combine la précision de la 
            gestion et la magie de la pâtisserie.
          </p>
          <button onClick={() => navigate('/bio')} className="btn-learn-more">
            En savoir plus
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <h2>Prêt à commander ?</h2>
        <p>Découvrez nos promotions ou créez votre commande personnalisée</p>
        <div className="cta-buttons">
          <button onClick={() => navigate('/promotions')} className="btn-cta-primary">
            Voir les Promotions
          </button>
          <button onClick={() => navigate('/personnalisation')} className="btn-cta-secondary">
            Personnaliser ma Commande
          </button>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="home-delivery">
        <h3>🚚 Livraison & Ramassage</h3>
        <div className="delivery-options-home">
          <div className="delivery-option-home">
            <span className="delivery-icon-home">📍</span>
            <span>Ramassage gratuit à Québec City</span>
          </div>
          <div className="delivery-option-home">
            <span className="delivery-icon-home">🚗</span>
            <span>Livraison 10 $ dans la ville de Québec</span>
          </div>
        </div>
      </section>
    </div>
  );
}
