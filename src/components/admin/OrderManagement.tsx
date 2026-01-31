import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date()
      });
      loadOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      loadOrders();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      ready: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status];
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString('fr-FR');
  };

  if (loading) {
    return <div className="loading">Chargement des commandes...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Toutes ({orders.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          En attente ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          Confirmées ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button 
          className={filter === 'ready' ? 'active' : ''} 
          onClick={() => setFilter('ready')}
        >
          Prêtes ({orders.filter(o => o.status === 'ready').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Terminées ({orders.filter(o => o.status === 'completed').length})
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">Aucune commande trouvée</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Commande #{order.id.slice(0, 8)}</h3>
                  <p className="order-email">{order.userEmail}</p>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </div>
              </div>

              <div className="order-items">
                <h4>Articles:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.productName}</span>
                    <span>x{item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="order-notes">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: {order.total.toFixed(2)} €</strong>
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="btn btn-primary"
                    >
                      Confirmer
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="btn btn-primary"
                    >
                      Marquer prête
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="btn btn-primary"
                    >
                      Terminer
                    </button>
                  )}
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="btn btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
