import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface DataListProps {
  user: User | null;
}

interface Item {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
}

export default function DataList({ user }: DataListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(itemsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await addDoc(collection(db, 'items'), {
        text: newItem,
        userId: user!.uid,
        createdAt: serverTimestamp()
      });
      setNewItem('');
      loadItems();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      loadItems();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!user) {
    return <p className="info">Veuillez vous connecter pour voir vos données.</p>;
  }

  if (loading) {
    return <p className="info">Chargement...</p>;
  }

  return (
    <div className="data-list">
      <h2>Mes données</h2>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Ajouter un élément..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Ajouter</button>
      </form>
      
      <ul>
        {items.length === 0 ? (
          <li className="empty">Aucun élément pour le moment</li>
        ) : (
          items.map(item => (
            <li key={item.id}>
              <span>{item.text}</span>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="btn btn-danger"
              >
                Supprimer
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
