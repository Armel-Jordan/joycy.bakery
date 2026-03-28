import { useTranslation } from 'react-i18next';

export default function Bio() {
  const { t } = useTranslation();

  return (
    <div className="bio-page-new">
      {/* Hero Section with Main Photo */}
      <section className="bio-hero-section">
        <div className="bio-hero-overlay"></div>
        <div className="bio-hero-content">
          <span className="bio-badge">{t('bio.badge')}</span>
          <h1>{t('bio.title')}</h1>
          <p className="bio-tagline">{t('bio.tagline')}</p>
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
              <span className="bio-section-label">{t('bio.about.label')}</span>
              <h2>{t('bio.about.title')}</h2>
              <p>{t('bio.about.p1')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('bio.about.p2') }} />
              <div className="bio-signature">
                <div className="bio-signature-line"></div>
                <span>{t('bio.about.signature')}</span>
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
              <span className="bio-section-label">{t('bio.commitment.label')}</span>
              <h2>{t('bio.commitment.title')}</h2>
              <blockquote className="bio-quote">
                "{t('bio.commitment.quote')}"
              </blockquote>
              <p>{t('bio.commitment.text')}</p>
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
            <span className="bio-section-label">{t('bio.specialties.label')}</span>
            <h2>{t('bio.specialties.title')}</h2>
          </div>
          <div className="bio-specialties-grid">
            <div className="bio-specialty-card">
              <div className="bio-specialty-icon">🍪</div>
              <h3>{t('bio.specialties.cookies.name')}</h3>
              <p>{t('bio.specialties.cookies.desc')}</p>
              <div className="bio-specialty-line"></div>
            </div>
            <div className="bio-specialty-card featured">
              <div className="bio-specialty-badge">{t('bio.specialties.popular')}</div>
              <div className="bio-specialty-icon">🥞</div>
              <h3>{t('bio.specialties.crepes.name')}</h3>
              <p>{t('bio.specialties.crepes.desc')}</p>
              <div className="bio-specialty-line"></div>
            </div>
            <div className="bio-specialty-card">
              <div className="bio-specialty-icon">🎂</div>
              <h3>{t('bio.specialties.cakes.name')}</h3>
              <p>{t('bio.specialties.cakes.desc')}</p>
              <div className="bio-specialty-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bio-values-section">
        <div className="bio-container">
          <div className="bio-section-header">
            <span className="bio-section-label">{t('bio.values.label')}</span>
            <h2>{t('bio.values.title')}</h2>
          </div>
          <div className="bio-values-grid">
            <div className="bio-value-card">
              <div className="bio-value-number">01</div>
              <div className="bio-value-icon">✨</div>
              <h3>{t('bio.values.creativity.title')}</h3>
              <p>{t('bio.values.creativity.desc')}</p>
            </div>
            <div className="bio-value-card">
              <div className="bio-value-number">02</div>
              <div className="bio-value-icon">❤️</div>
              <h3>{t('bio.values.passion.title')}</h3>
              <p>{t('bio.values.passion.desc')}</p>
            </div>
            <div className="bio-value-card">
              <div className="bio-value-number">03</div>
              <div className="bio-value-icon">🎯</div>
              <h3>{t('bio.values.quality.title')}</h3>
              <p>{t('bio.values.quality.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bio-cta-section">
        <div className="bio-container">
          <div className="bio-cta-content">
            <h2>{t('bio.cta.title')}</h2>
            <p>{t('bio.cta.desc')}</p>
            <div className="bio-cta-buttons">
              <a href="/promotions" className="bio-cta-btn primary">{t('bio.cta.seePromos')}</a>
              <a href="/personnalisation" className="bio-cta-btn secondary">{t('bio.cta.orderCustom')}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
