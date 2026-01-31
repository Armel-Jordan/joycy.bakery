import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Product, OrderItem } from '../../types';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'completed'>('all');
  const [showPhoneOrderForm, setShowPhoneOrderForm] = useState(false);
  const [phoneOrderItems, setPhoneOrderItems] = useState<OrderItem[]>([]);
  const [phoneOrderData, setPhoneOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
    loadProducts();
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

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData.filter(p => p.available));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
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

  const addProductToPhoneOrder = (product: Product) => {
    const existingItem = phoneOrderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setPhoneOrderItems(phoneOrderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPhoneOrderItems([...phoneOrderItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const updatePhoneOrderItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setPhoneOrderItems(phoneOrderItems.filter(item => item.productId !== productId));
    } else {
      setPhoneOrderItems(phoneOrderItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const createPhoneOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneOrderItems.length === 0) {
      alert('Veuillez ajouter au moins un produit à la commande');
      return;
    }
    
    const total = phoneOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      await addDoc(collection(db, 'orders'), {
        userId: 'phone-order',
        userEmail: phoneOrderData.customerEmail || phoneOrderData.customerPhone,
        items: phoneOrderItems,
        total,
        status: 'pending',
        notes: `Commande téléphonique - Client: ${phoneOrderData.customerName}${phoneOrderData.customerPhone ? ' - Tél: ' + phoneOrderData.customerPhone : ''}${phoneOrderData.notes ? '\n' + phoneOrderData.notes : ''}`,
        deliveryDate: phoneOrderData.deliveryDate,
        isPhoneOrder: true,
        createdAt: serverTimestamp()
      });
      
      setPhoneOrderData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryDate: '',
        notes: ''
      });
      setPhoneOrderItems([]);
      setShowPhoneOrderForm(false);
      loadOrders();
      alert('Commande téléphonique créée avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la création de la commande');
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
      <div className="management-header">
        <h2>📦 Gestion des Commandes</h2>
        <button 
          onClick={() => setShowPhoneOrderForm(!showPhoneOrderForm)} 
          className="btn btn-primary"
        >
          {showPhoneOrderForm ? 'Annuler' : '📞 Nouvelle Commande Téléphonique'}
        </button>
      </div>

      {showPhoneOrderForm && (
        <form onSubmit={createPhoneOrder} className="phone-order-form">
          <h3>Nouvelle commande téléphonique</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nom du client *</label>
              <input
                type="text"
                value={phoneOrderData.customerName}
                onChange={(e) => setPhoneOrderData({ ...phoneOrderData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                value={phoneOrderData.customerPhone}
                onChange={(e) => setPhoneOrderData({ ...phoneOrderData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email (optionnel)</label>
              <input
                type="email"
                value={phoneOrderData.customerEmail}
                onChange={(e) => setPhoneOrderData({ ...phoneOrderData, customerEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date de livraison *</label>
              <input
                type="date"
                value={phoneOrderData.deliveryDate}
                onChange={(e) => setPhoneOrderData({ ...phoneOrderData, deliveryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={phoneOrderData.notes}
              onChange={(e) => setPhoneOrderData({ ...phoneOrderData, notes: e.target.value })}
              placeholder="Instructions spéciales, allergies, etc."
            />
          </div>

          <div className="form-group">
            <label>Produits *</label>
            <div className="product-selector">
              {products.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProductToPhoneOrder(product)}
                  className="product-selector-btn"
                >
                  {product.name} - {product.price.toFixed(2)}€
                </button>
              ))}
            </div>
          </div>

          {phoneOrderItems.length > 0 && (
            <div className="phone-order-items">
              <h4>Articles de la commande:</h4>
              {phoneOrderItems.map(item => (
                <div key={item.productId} className="phone-order-item">
                  <span>{item.productName}</span>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => updatePhoneOrderItemQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updatePhoneOrderItemQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
              <div className="phone-order-total">
                <strong>Total: {phoneOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€</strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => setShowPhoneOrderForm(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer la commande
            </button>
          </div>
        </form>
      )}

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
                  <h3>
                    {order.isPhoneOrder && '📞 '}
                    Commande #{order.id.slice(0, 8)}
                  </h3>
                  <p className="order-email">{order.userEmail}</p>
                  <p className="order-date">Passée le: {formatDate(order.createdAt)}</p>
                  {order.deliveryDate && (
                    <p className="order-date">Livraison: {new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</p>
                  )}
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
