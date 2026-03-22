import { useState } from 'react';
import { User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import CalendarView from '../components/admin/CalendarView';
import VacationManagement from '../components/admin/VacationManagement';
import TeamManagement from '../components/admin/TeamManagement';

interface AdminDashboardProps {
  user: User | null;
}

type TabType = 'orders' | 'team' | 'products' | 'vacation' | 'calendar';

const ALLOWED_ADMIN_EMAILS = [
  'joycekeumogne1@gmail.com',
  'jkuibia@gmail.com'
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user && ALLOWED_ADMIN_EMAILS.includes(user.email || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!ALLOWED_ADMIN_EMAILS.includes(userCredential.user.email || '')) {
        await signOut(auth);
        setError('Accès refusé. Vous n\'êtes pas autorisé à accéder à cette page.');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login-container">
          <h1>🔐 Accès Administrateur</h1>
          <p>Connectez-vous pour accéder au tableau de bord.</p>
          
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <a href="/" className="back-link">← Retour au site</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>📊 Tableau de Bord Administrateur</h1>
        <div className="admin-user-info">
          <p>Bienvenue, {user?.email}</p>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📦 Commandes
        </button>
        <button
          className={activeTab === 'team' ? 'active' : ''}
          onClick={() => setActiveTab('team')}
        >
          👥 Équipe
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          🍰 Produits
        </button>
        <button
          className={activeTab === 'vacation' ? 'active' : ''}
          onClick={() => setActiveTab('vacation')}
        >
          Mes Congés
        </button>
        <button
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendrier
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'vacation' && <VacationManagement />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </div>
  );
}
