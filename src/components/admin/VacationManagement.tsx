import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Vacation } from '../../types';

export default function VacationManagement() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadVacations();
  }, []);

  const loadVacations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'vacations'));
      const vacationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vacation[];
      
      vacationsData.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
      
      setVacations(vacationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('La date de fin doit être après la date de début');
      return;
    }
    
    try {
      await addDoc(collection(db, 'vacations'), {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        createdAt: serverTimestamp()
      });
      
      resetForm();
      loadVacations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des congés');
    }
  };

  const deleteVacation = async (vacationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette période de congés ?')) return;
    
    try {
      await deleteDoc(doc(db, 'vacations', vacationId));
      loadVacations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return <div className="loading">Chargement des congés...</div>;
  }

  return (
    <div className="vacation-management">
      <div className="management-header">
        <h2>🏖️ Gestion des Congés</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? 'Annuler' : '+ Ajouter des Congés'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="vacation-form">
          <h3>Nouvelle période de congés</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date de début *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Raison (optionnel)</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Vacances d'été, Congés familiaux..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="vacations-list">
        {vacations.length === 0 ? (
          <div className="empty-state">Aucune période de congés enregistrée</div>
        ) : (
          vacations.map(vacation => {
            const isPast = new Date(vacation.endDate) < new Date();
            const isUpcoming = new Date(vacation.startDate) > new Date();
            const isCurrent = !isPast && !isUpcoming;
            
            return (
              <div key={vacation.id} className={`vacation-card ${isPast ? 'past' : isCurrent ? 'current' : 'upcoming'}`}>
                <div className="vacation-header">
                  <div>
                    <h3>
                      {isCurrent && '🔴 '}
                      {isUpcoming && '🟡 '}
                      {isPast && '⚪ '}
                      {vacation.reason || 'Congés'}
                    </h3>
                    <p className="vacation-status">
                      {isCurrent && 'En cours'}
                      {isUpcoming && 'À venir'}
                      {isPast && 'Terminé'}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteVacation(vacation.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
                
                <div className="vacation-details">
                  <div className="vacation-date">
                    <strong>Du:</strong> {formatDate(vacation.startDate)}
                  </div>
                  <div className="vacation-date">
                    <strong>Au:</strong> {formatDate(vacation.endDate)}
                  </div>
                  <div className="vacation-duration">
                    <strong>Durée:</strong> {getDuration(vacation.startDate, vacation.endDate)} jour(s)
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
