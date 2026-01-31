import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import Auth from './components/Auth'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function Navigation({ user }: { user: User | null }) {
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
        {user && (
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Admin
          </Link>
        )}
      </div>
      <div className="nav-auth">
        <Auth user={user} />
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
        <Navigation user={user} />
        <main>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
