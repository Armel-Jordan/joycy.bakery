import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

interface CustomOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  productType: string;
  occasion: string;
  quantity: string;
  deliveryDate: string;
  flavors: string;
  colors: string;
  decoration: string;
  allergies: string;
  description: string;
  status: 'new' | 'in_progress' | 'done' | 'cancelled';
  createdAt: any;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: 'Nouvelle',    color: '#e67e22' },
  in_progress: { label: 'En cours',   color: '#2980b9' },
  done:        { label: 'Terminée',   color: '#27ae60' },
  cancelled:   { label: 'Annulée',    color: '#c0392b' },
};

export default function CustomOrderManagement() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'customOrders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomOrder)));
    } catch {
      console.error('Erreur chargement demandes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'customOrders', id), { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Supprimer cette demande ?')) return;
    await deleteDoc(doc(db, 'customOrders', id));
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);

  if (loading) return <div className="loading">Chargement des demandes...</div>;

  return (
    <div className="custom-order-mgmt">
      <div className="management-header">
        <h2>🎨 Demandes personnalisées</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Actualiser</button>
      </div>

      <div className="custom-order-filters">
        {['all', 'new', 'in_progress', 'done', 'cancelled'].map(s => (
          <button
            key={s}
            className={`filter-btn${filterStatus === s ? ' active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'Toutes' : STATUS_LABELS[s]?.label}
            {s === 'all'
              ? ` (${orders.length})`
              : ` (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          Aucune demande
        </div>
      ) : (
        <div className="custom-order-list">
          {filtered.map(order => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className={`custom-order-card${isOpen ? ' open' : ''}`}>
                <div className="custom-order-card-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className="custom-order-card-left">
                    <span className="custom-order-badge" style={{ background: st.color }}>{st.label}</span>
                    <div>
                      <strong>{order.clientName}</strong>
                      <span className="custom-order-meta"> · {order.productType}{order.occasion ? ` · ${order.occasion}` : ''}</span>
                    </div>
                    <span className="custom-order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="custom-order-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div className="custom-order-card-body">
                    <div className="custom-order-details-grid">
                      <div className="custom-order-section">
                        <h4>👤 Client</h4>
                        <p><strong>Nom :</strong> {order.clientName}</p>
                        <p><strong>Tél :</strong> <a href={`tel:${order.clientPhone}`}>{order.clientPhone}</a></p>
                        <p><strong>Email :</strong> <a href={`mailto:${order.clientEmail}`}>{order.clientEmail}</a></p>
                      </div>
                      <div className="custom-order-section">
                        <h4>🛍️ Commande</h4>
                        <p><strong>Produit :</strong> {order.productType}</p>
                        {order.occasion   && <p><strong>Occasion :</strong> {order.occasion}</p>}
                        {order.quantity   && <p><strong>Quantité :</strong> {order.quantity}</p>}
                        {order.deliveryDate && <p><strong>Date souhaitée :</strong> {order.deliveryDate}</p>}
                      </div>
                      <div className="custom-order-section custom-order-section--full">
                        <h4>📝 Description</h4>
                        {order.flavors    && <p><strong>Saveurs :</strong> {order.flavors}</p>}
                        {order.colors     && <p><strong>Couleurs :</strong> {order.colors}</p>}
                        {order.decoration && <p><strong>Décoration :</strong> {order.decoration}</p>}
                        {order.allergies  && <p><strong>Allergies :</strong> {order.allergies}</p>}
                        {order.description && <p><strong>Note :</strong> {order.description}</p>}
                      </div>
                    </div>

                    <div className="custom-order-actions">
                      <div className="custom-order-status-btns">
                        <span>Statut :</span>
                        {(['new', 'in_progress', 'done', 'cancelled'] as const).map(s => (
                          <button
                            key={s}
                            className={`btn btn-sm${order.status === s ? ' btn-primary' : ' btn-secondary'}`}
                            onClick={() => updateStatus(order.id, s)}
                          >
                            {STATUS_LABELS[s].label}
                          </button>
                        ))}
                      </div>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(order.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
