import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { CartProvider, useCart } from './context/CartContext'
import { useTranslation } from 'react-i18next'
import Home from './pages/Home'
import Bio from './pages/Bio'
import Promotions from './pages/Promotions'
import Personnalisation from './pages/Personnalisation'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language)

  const toggle = (l: string) => {
    i18n.changeLanguage(l)
    localStorage.setItem('lang', l)
    setLang(l)
  }

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
        onClick={() => toggle('fr')}
      >FR</button>
      <span className="lang-sep">|</span>
      <button
        className={`lang-btn${lang === 'en' ? ' active' : ''}`}
        onClick={() => toggle('en')}
      >EN</button>
    </div>
  )
}

function Navigation() {
  const location = useLocation()
  const { getItemCount } = useCart()
  const { t } = useTranslation()

  if (location.pathname === '/admin') {
    return null
  }

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">
          <img src="/logo.png" alt="Joycy Bakery" className="nav-logo" />
          <span>Joycy Bakery</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          {t('nav.home')}
        </Link>
        <Link to="/bio" className={location.pathname === '/bio' ? 'active' : ''}>
          {t('nav.bio')}
        </Link>
        <Link to="/promotions" className={location.pathname === '/promotions' ? 'active' : ''}>
          {t('nav.promotions')}
        </Link>
        <Link to="/personnalisation" className={location.pathname === '/personnalisation' ? 'active' : ''}>
          {t('nav.personnalisation')}
        </Link>
        <Link to="/produits" className={location.pathname === '/produits' ? 'active' : ''}>
          {t('nav.products')}
        </Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
          {t('nav.contact')}
        </Link>
      </div>
      <div className="nav-cart">
        <LanguageSwitcher />
        <Link to="/cart" className="cart-icon">
          🛒 {getItemCount() > 0 && <span className="cart-badge">{getItemCount()}</span>}
        </Link>
      </div>
    </nav>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">{t('nav.loading')}</div>
  }

  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/bio" element={<Bio />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/personnalisation" element={<Personnalisation />} />
              <Route path="/produits" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
