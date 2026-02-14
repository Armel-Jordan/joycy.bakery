export default function Bio() {
  return (
    <div className="bio-page-new">
      {/* Hero Section with Main Photo */}
      <section className="bio-hero-section">
        <div className="bio-hero-overlay"></div>
        <div className="bio-hero-content">
          <span className="bio-badge">🍰 Artisane Pâtissière</span>
          <h1>À Propos de Joycy Bakery</h1>
          <p className="bio-tagline">De l'art qui se mange, du goût qui reste</p>
        </div>
      </section>

      {/* About Section - Photo 1 */}
      <section className="bio-about-section">
        <div className="bio-container">
          <div className="bio-about-grid">
            <div className="bio-photo-wrapper">
              <div className="bio-photo-frame">
                <img src="/bio1.jpeg" alt="Joyce - Joycy Bakery" className="bio-main-photo" />
              </div>
              <div className="bio-photo-decoration"></div>
            </div>
            <div className="bio-about-content">
              <span className="bio-section-label">Mon Histoire</span>
              <h2>Passionnée & Créative</h2>
              <p>
                Étudiante passionnée et créative basée à Québec, je suis la fondatrice de Joycy Bakery. 
                Entrepreneure le jour et pâtissière passionnée la nuit, je combine la précision de la 
                gestion et la magie de la pâtisserie.
              </p>
              <p>
                Mon univers ? Des <strong>cookies XL irrésistibles</strong>, des <strong>crêpes qui fondent en bouche</strong> et 
                des <strong>gâteaux personnalisés (Cake Design)</strong> créés sur mesure pour vos plus beaux moments.
              </p>
              <div className="bio-signature">
                <div className="bio-signature-line"></div>
                <span>Joyce, Fondatrice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section - Photo 2 */}
      <section className="bio-commitment-section">
        <div className="bio-container">
          <div className="bio-commitment-grid">
            <div className="bio-commitment-content">
              <span className="bio-section-label">Mon Engagement</span>
              <h2>Made with Love</h2>
              <blockquote className="bio-quote">
                "De l'art qui se mange, du goût qui reste."
              </blockquote>
              <p>
                Chaque création est pensée avec soin, préparée avec amour et livrée avec le sourire. 
                Ma mission est de transformer vos moments spéciaux en souvenirs délicieux.
              </p>
            </div>
            <div className="bio-photo-wrapper reverse">
              <div className="bio-photo-frame">
                <img src="/bio2.jpeg" alt="Joyce dans sa cuisine" className="bio-main-photo" />
              </div>
              <div className="bio-photo-decoration reverse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="bio-specialties-section">
        <div className="bio-container">
          <div className="bio-section-header">
            <span className="bio-section-label">Ce que je fais</span>
            <h2>Mes Spécialités</h2>
          </div>
          <div className="bio-specialties-grid">
            <div className="bio-specialty-card">
              <div className="bio-specialty-icon">🍪</div>
              <h3>Cookies XL</h3>
              <p>Irrésistibles et généreux, parfaits pour tous les moments gourmands</p>
              <div className="bio-specialty-line"></div>
            </div>
            <div className="bio-specialty-card featured">
              <div className="bio-specialty-badge">Populaire</div>
              <div className="bio-specialty-icon">🥞</div>
              <h3>Crêpes</h3>
              <p>Nature, citron ou vanille - qui fondent en bouche</p>
              <div className="bio-specialty-line"></div>
            </div>
            <div className="bio-specialty-card">
              <div className="bio-specialty-icon">🎂</div>
              <h3>Cake Design</h3>
              <p>Gâteaux personnalisés créés sur mesure pour vos événements spéciaux</p>
              <div className="bio-specialty-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bio-values-section">
        <div className="bio-container">
          <div className="bio-section-header">
            <span className="bio-section-label">Ce qui me guide</span>
            <h2>Mes Valeurs</h2>
          </div>
          <div className="bio-values-grid">
            <div className="bio-value-card">
              <div className="bio-value-number">01</div>
              <div className="bio-value-icon">✨</div>
              <h3>Créativité</h3>
              <p>Chaque création est unique et pensée avec soin</p>
            </div>
            <div className="bio-value-card">
              <div className="bio-value-number">02</div>
              <div className="bio-value-icon">❤️</div>
              <h3>Passion</h3>
              <p>L'amour de la pâtisserie dans chaque bouchée</p>
            </div>
            <div className="bio-value-card">
              <div className="bio-value-number">03</div>
              <div className="bio-value-icon">🎯</div>
              <h3>Qualité</h3>
              <p>Des ingrédients soigneusement sélectionnés</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bio-cta-section">
        <div className="bio-container">
          <div className="bio-cta-content">
            <h2>Prêt à goûter la différence ?</h2>
            <p>Découvrez nos créations et passez votre commande</p>
            <div className="bio-cta-buttons">
              <a href="/promotions" className="bio-cta-btn primary">Voir les Promotions</a>
              <a href="/personnalisation" className="bio-cta-btn secondary">Commander sur Mesure</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
