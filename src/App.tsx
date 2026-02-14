import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { CartProvider, useCart } from './context/CartContext'
import Home from './pages/Home'
import Bio from './pages/Bio'
import Promotions from './pages/Promotions'
import Personnalisation from './pages/Personnalisation'
import Products from './pages/Products'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function Navigation() {
  const location = useLocation()
  const { getItemCount } = useCart()
  
  // Hide navigation on admin page
  if (location.pathname === '/admin') {
    return null
  }
  
  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">
          <img src="/logo.jpeg" alt="Joycy Bakery" className="nav-logo" />
          <span>Joycy Bakery</span>
        </Link>
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
        <Link to="/personnalisation" className={location.pathname === '/personnalisation' ? 'active' : ''}>
          Personnalisation
        </Link>
        <Link to="/produits" className={location.pathname === '/produits' ? 'active' : ''}>
          Produits
        </Link>
      </div>
      <div className="nav-cart">
        <Link to="/cart" className="cart-icon">
          🛒 <span className="cart-badge">{getItemCount()}</span>
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
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
