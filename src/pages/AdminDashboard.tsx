import { useState } from 'react';
import { User } from 'firebase/auth';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import CalendarView from '../components/admin/CalendarView';

interface AdminDashboardProps {
  user: User | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'calendar'>('orders');

  if (!user) {
    return (
      <div className="admin-login-required">
        <h2>Accès Administrateur</h2>
        <p>Veuillez vous connecter pour accéder au tableau de bord</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🔐 Tableau de Bord Admin</h1>
        <p>Bienvenue, {user.email}</p>
      </header>

      <nav className="admin-tabs">
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📋 Commandes
        </button>
        <button
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendrier
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          🧁 Produits
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'products' && <ProductManagement />}
      </main>
    </div>
  );
}
