import { useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
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

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [lang, setLang] = useState(i18n.language);

  const NAV_ITEMS: { id: TabType; icon: string; label: string }[] = [
    { id: 'orders',     icon: '📦', label: t('admin.nav.orders')     },
    { id: 'custom',     icon: '🎨', label: t('admin.nav.custom')     },
    { id: 'products',   icon: '🍰', label: t('admin.nav.products')   },
    { id: 'promotions', icon: '🎉', label: t('admin.nav.promotions') },
    { id: 'team',       icon: '👥', label: t('admin.nav.team')       },
    { id: 'calendar',   icon: '📅', label: t('admin.nav.calendar')   },
    { id: 'vacation',   icon: '🏖️', label: t('admin.nav.vacation')   },
    { id: 'hours',      icon: '🕐', label: t('admin.nav.hours')      },
    { id: 'password',   icon: '🔑', label: t('admin.nav.password')   },
  ];

  const toggleLang = (l: string) => {
    i18n.changeLanguage(l);
    localStorage.setItem('lang', l);
    setLang(l);
  };

  const isAdmin = user && ALLOWED_ADMIN_EMAILS.includes(user.email || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!ALLOWED_ADMIN_EMAILS.includes(cred.user.email || '')) {
        await signOut(auth);
        setError(t('admin.login.accessDenied'));
      }
    } catch (err: any) {
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? t('admin.login.wrongCredentials')
          : t('admin.login.connectionError')
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
      setResetSuccess(t('admin.login.resetSuccess'));
    } catch {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
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
              <h1>{t('admin.login.resetTitle')}</h1>
              <p>{t('admin.login.resetSubtitle')}</p>
              <form onSubmit={handleResetPassword} className="admin-login-form">
                <div className="form-group">
                  <label>{t('admin.login.email')}</label>
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="votre@email.com" required />
                </div>
                {error        && <p className="error-message">{error}</p>}
                {resetSuccess && <p className="success-message">{resetSuccess}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? t('admin.login.resetSubmitting') : t('admin.login.resetSubmit')}
                </button>
              </form>
              <button className="admin-text-btn" onClick={() => { setResetMode(false); setError(''); setResetSuccess(''); }}>
                {t('admin.login.backToLogin')}
              </button>
            </>
          ) : (
            <>
              <h1>{t('admin.login.title')}</h1>
              <p>{t('admin.login.subtitle')}</p>
              <form onSubmit={handleLogin} className="admin-login-form">
                <div className="form-group">
                  <label>{t('admin.login.email')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
                </div>
                <div className="form-group">
                  <label>{t('admin.login.password')}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? t('admin.login.submitting') : t('admin.login.submit')}
                </button>
              </form>
              <button className="admin-text-btn" onClick={() => { setResetMode(true); setError(''); }}>
                {t('admin.login.forgotPassword')}
              </button>
              <a href="/" className="admin-text-btn">{t('admin.login.backToSite')}</a>
            </>
          )}
          {/* Lang switcher on login page */}
          <div className="lang-switcher" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} onClick={() => toggleLang('fr')}>FR</button>
            <span className="lang-sep">|</span>
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
          </div>
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
          {/* Lang switcher in sidebar */}
          <div className="lang-switcher" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.08)' }}>
            <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} style={{ color: lang === 'fr' ? '#fff' : '#c9a87c' }} onClick={() => toggleLang('fr')}>FR</button>
            <span className="lang-sep" style={{ color: '#c9a87c' }}>|</span>
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} style={{ color: lang === 'en' ? '#fff' : '#c9a87c' }} onClick={() => toggleLang('en')}>EN</button>
          </div>
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-avatar">
              {user?.email?.[0].toUpperCase()}
            </span>
            <span className="admin-sidebar-email">{user?.email}</span>
          </div>
          <button className="admin-logout-btn" onClick={() => signOut(auth)}>
            {t('admin.logout')}
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
          {activeTab === 'orders'     && <OrderManagement />}
          {activeTab === 'custom'     && <CustomOrderManagement />}
          {activeTab === 'products'   && <ProductManagement />}
          {activeTab === 'promotions' && <PromotionManagement />}
          {activeTab === 'team'       && <TeamManagement />}
          {activeTab === 'calendar'   && <CalendarView />}
          {activeTab === 'vacation'   && <VacationManagement />}
          {activeTab === 'hours'      && <HoursManagement />}
          {activeTab === 'password'   && <PasswordManagement />}
        </div>
      </main>
    </div>
  );
}
