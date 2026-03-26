import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface DayHours {
  name: string;
  open: string;
  close: string;
  closed: boolean;
}

const DEFAULT_HOURS: DayHours[] = [
  { name: 'Lundi',    open: '09:00', close: '18:00', closed: false },
  { name: 'Mardi',    open: '09:00', close: '18:00', closed: false },
  { name: 'Mercredi', open: '09:00', close: '18:00', closed: false },
  { name: 'Jeudi',    open: '09:00', close: '18:00', closed: false },
  { name: 'Vendredi', open: '09:00', close: '18:00', closed: false },
  { name: 'Samedi',   open: '10:00', close: '18:00', closed: false },
  { name: 'Dimanche', open: '10:00', close: '18:00', closed: false },
];

export default function HoursManagement() {
  const [days, setDays] = useState<DayHours[]>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'businessHours'));
        if (snap.exists() && snap.data().days) {
          setDays(snap.data().days);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateDay = (index: number, field: keyof DayHours, value: string | boolean) => {
    setDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, 'settings', 'businessHours'), { days });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Chargement des horaires...</div>;

  return (
    <div className="hours-management">
      <div className="management-header">
        <h2>🕐 Horaires d'ouverture</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      <div className="hours-table">
        <div className="hours-header-row">
          <span>Jour</span>
          <span>Ouverture</span>
          <span>Fermeture</span>
          <span>Fermé</span>
        </div>
        {days.map((day, i) => (
          <div key={day.name} className={`hours-row${day.closed ? ' hours-row--closed' : ''}`}>
            <span className="hours-day">{day.name}</span>
            <input
              type="time"
              value={day.open}
              disabled={day.closed}
              onChange={e => updateDay(i, 'open', e.target.value)}
              className="hours-input"
            />
            <input
              type="time"
              value={day.close}
              disabled={day.closed}
              onChange={e => updateDay(i, 'close', e.target.value)}
              className="hours-input"
            />
            <label className="hours-closed-toggle">
              <input
                type="checkbox"
                checked={day.closed}
                onChange={e => updateDay(i, 'closed', e.target.checked)}
              />
              <span>Fermé</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
