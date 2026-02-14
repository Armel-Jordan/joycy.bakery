export default function Bio() {
  return (
    <div className="bio-page">
      <div className="bio-hero">
        <div className="bio-content">
          <h1>À Propos de Joycy Bakery</h1>
          <div className="bio-story">
            <div className="bio-text">
              <h2>Mon Histoire</h2>
              <p>
                Étudiante passionnée et créative basée à Québec, je suis la fondatrice de Joycy Bakery. 
                Entrepreneure le jour et pâtissière passionnée la nuit, je combine la précision de la 
                gestion et la magie de la pâtisserie.
              </p>
              <p>
                Mon univers ? Des <strong>cookies XL irrésistibles</strong>, des <strong>crêpes qui fondent en bouche</strong> et 
                des <strong>gâteaux personnalisés (Cake Design)</strong> créés sur mesure pour vos plus beaux moments.
              </p>
              <p className="bio-commitment">
                <strong>Mon engagement :</strong> De l'art qui se mange, du goût qui reste.
              </p>
            </div>
            <div className="bio-images">
              <div className="bio-image-grid">
                <div className="bio-image-placeholder">
                  <p>📸 Photo de Joyce en train de préparer des cookies</p>
                </div>
                <div className="bio-image-placeholder">
                  <p>📸 Photo de Joyce dans sa cuisine</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bio-specialties">
            <h2>Mes Spécialités</h2>
            <div className="specialties-grid">
              <div className="specialty-card">
                <div className="specialty-icon">🍪</div>
                <h3>Cookies XL</h3>
                <p>Irrésistibles et généreux, parfaits pour tous les moments gourmands</p>
              </div>
              <div className="specialty-card">
                <div className="specialty-icon">🥞</div>
                <h3>Crêpes</h3>
                <p>Nature, citron ou vanille - qui fondent en bouche</p>
              </div>
              <div className="specialty-card">
                <div className="specialty-icon">🎂</div>
                <h3>Cake Design</h3>
                <p>Gâteaux personnalisés créés sur mesure pour vos événements spéciaux</p>
              </div>
            </div>
          </div>

          <div className="bio-values">
            <h2>Mes Valeurs</h2>
            <div className="values-list">
              <div className="value-item">
                <span className="value-icon">✨</span>
                <div>
                  <h3>Créativité</h3>
                  <p>Chaque création est unique et pensée avec soin</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">❤️</span>
                <div>
                  <h3>Passion</h3>
                  <p>L'amour de la pâtisserie dans chaque bouchée</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <div>
                  <h3>Qualité</h3>
                  <p>Des ingrédients soigneusement sélectionnés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
