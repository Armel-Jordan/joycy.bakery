import { useState } from 'react';
import { User } from 'firebase/auth';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import CalendarView from '../components/admin/CalendarView';
import VacationManagement from '../components/admin/VacationManagement';

interface AdminDashboardProps {
  user: User | null;
}

type TabType = 'orders' | 'products' | 'vacation' | 'calendar';

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div className="admin-login-required">
          <h2>🔒 Accès Administrateur</h2>
          <p>Veuillez vous connecter pour accéder au tableau de bord administrateur.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>📊 Tableau de Bord Administrateur</h1>
        <p>Bienvenue, {user.email}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📦 Commandes
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
          🏖️ Mes Congés
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
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'vacation' && <VacationManagement />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </div>
  );
}
