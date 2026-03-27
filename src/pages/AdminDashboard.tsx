import { useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import CalendarView from '../components/admin/CalendarView';
import VacationManagement from '../components/admin/VacationManagement';
import TeamManagement from '../components/admin/TeamManagement';
import PasswordManagement from '../components/admin/PasswordManagement';
import HoursManagement from '../components/admin/HoursManagement';
import CustomOrderManagement from '../components/admin/CustomOrderManagement';
import PromotionManagement from '../components/admin/PromotionManagement';

interface AdminDashboardProps {
  user: User | null;
}

type TabType = 'orders' | 'custom' | 'products' | 'promotions' | 'team' | 'calendar' | 'vacation' | 'hours' | 'password';

const ALLOWED_ADMIN_EMAILS = [
  'joycekeumogne1@gmail.com',
  'jkuibia@gmail.com'
];

const NAV_ITEMS: { id: TabType; icon: string; label: string }[] = [
  { id: 'orders',   icon: '📦', label: 'Commandes'        },
  { id: 'custom',   icon: '🎨', label: 'Personnalisations' },
  { id: 'products',   icon: '🍰', label: 'Produits'      },
  { id: 'promotions', icon: '🎉', label: 'Promotions'    },
  { id: 'team',       icon: '👥', label: 'Équipe'        },
  { id: 'calendar', icon: '📅', label: 'Calendrier'        },
  { id: 'vacation', icon: '🏖️', label: 'Congés'            },
  { id: 'hours',    icon: '🕐', label: 'Horaires'          },
  { id: 'password', icon: '🔑', label: 'Mot de passe'      },
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const isAdmin = user && ALLOWED_ADMIN_EMAILS.includes(user.email || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!ALLOWED_ADMIN_EMAILS.includes(cred.user.email || '')) {
        await signOut(auth);
        setError('Accès refusé. Vous n\'êtes pas autorisé.');
      }
    } catch (err: any) {
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Email ou mot de passe incorrect.'
          : 'Erreur de connexion. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setResetSuccess(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Email de réinitialisation envoyé. Vérifiez votre boîte mail.');
    } catch {
      setError('Impossible d\'envoyer l\'email. Vérifiez l\'adresse saisie.');
    } finally {
      setLoading(false);
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeTab);

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login-container">
          <div className="admin-login-logo">🍪</div>
          {resetMode ? (
            <>
              <h1>Mot de passe oublié</h1>
              <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <form onSubmit={handleResetPassword} className="admin-login-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="votre@email.com" required />
                </div>
                {error       && <p className="error-message">{error}</p>}
                {resetSuccess && <p className="success-message">{resetSuccess}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
              </form>
              <button className="admin-text-btn" onClick={() => { setResetMode(false); setError(''); setResetSuccess(''); }}>
                ← Retour à la connexion
              </button>
            </>
          ) : (
            <>
              <h1>Accès Administrateur</h1>
              <p>Connectez-vous pour accéder au tableau de bord.</p>
              <form onSubmit={handleLogin} className="admin-login-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>
              <button className="admin-text-btn" onClick={() => { setResetMode(true); setError(''); }}>
                Mot de passe oublié ?
              </button>
              <a href="/" className="admin-text-btn">← Retour au site</a>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-logo">
          <span>🍪</span>
          <span>Joycy Bakery</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-avatar">
              {user?.email?.[0].toUpperCase()}
            </span>
            <span className="admin-sidebar-email">{user?.email}</span>
          </div>
          <button className="admin-logout-btn" onClick={() => signOut(auth)}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="admin-page-title">
            <span>{currentNav?.icon}</span> {currentNav?.label}
          </h1>
        </div>

        <div className="admin-content">
          {activeTab === 'orders'   && <OrderManagement />}
          {activeTab === 'custom'   && <CustomOrderManagement />}
          {activeTab === 'products'   && <ProductManagement />}
          {activeTab === 'promotions' && <PromotionManagement />}
          {activeTab === 'team'       && <TeamManagement />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'vacation' && <VacationManagement />}
          {activeTab === 'hours'    && <HoursManagement />}
          {activeTab === 'password' && <PasswordManagement />}
        </div>
      </main>
    </div>
  );
}
