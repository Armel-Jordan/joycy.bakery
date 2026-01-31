import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { TeamMember } from '../../types';

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teamMembers'));
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      
      setTeamMembers(members.sort((a, b) => 
        b.createdAt.seconds - a.createdAt.seconds
      ));
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      alert('Erreur lors du chargement des membres de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      alert('Veuillez remplir au moins le nom et le rôle');
      return;
    }

    try {
      await addDoc(collection(db, 'teamMembers'), {
        name: formData.name,
        role: formData.role,
        email: formData.email || null,
        phone: formData.phone || null,
        schedule: [],
        createdAt: serverTimestamp()
      });

      alert('Membre ajouté avec succès !');
      resetForm();
      loadTeamMembers();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout du membre');
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'teamMembers', id));
      alert('Membre supprimé avec succès');
      loadTeamMembers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du membre');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: ''
    });
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="team-management">
      <div className="management-header">
        <h2>👥 Gestion de l'Équipe</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Annuler' : '➕ Ajouter un Membre'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="team-form">
          <h3>Nouveau Membre</h3>
          
          <div className="form-group">
            <label>Nom complet *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Marie Dupont"
              required
            />
          </div>

          <div className="form-group">
            <label>Rôle *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex: Pâtissière, Boulanger, Assistant"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Ajouter le Membre
            </button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="team-list">
        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <p>Aucun membre dans l'équipe. Ajoutez votre premier membre !</p>
          </div>
        ) : (
          teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <div className="team-header">
                <div>
                  <h3>👤 {member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
                <button
                  onClick={() => deleteMember(member.id)}
                  className="btn btn-danger"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>

              <div className="team-details">
                {member.email && (
                  <p className="team-contact">
                    📧 {member.email}
                  </p>
                )}
                {member.phone && (
                  <p className="team-contact">
                    📱 {member.phone}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
