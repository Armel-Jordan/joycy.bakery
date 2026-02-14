import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import Home from './pages/Home'
import Bio from './pages/Bio'
import Promotions from './pages/Promotions'
import Products from './pages/Products'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">🧁 Joycy Bakery</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Accueil
        </Link>
        <Link to="/bio" className={location.pathname === '/bio' ? 'active' : ''}>
          Bio
        </Link>
        <Link to="/promotions" className={location.pathname === '/promotions' ? 'active' : ''}>
          Promotions
        </Link>
        <Link to="/produits" className={location.pathname === '/produits' ? 'active' : ''}>
          Produits
        </Link>
      </div>
      <div className="nav-cart">
        <Link to="/cart" className="cart-icon">
          🛒 <span className="cart-badge">0</span>
        </Link>
      </div>
    </nav>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/bio" element={<Bio />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/produits" element={<Products />} />
            <Route path="/cart" element={<div className="cart-page"><h1>🛒 Panier</h1><p>Fonctionnalité à venir</p></div>} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
