import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Vacation } from '../../types';

interface DayEvent {
  orderPlaced: Order[];
  deliveries: Order[];
  vacations: Vacation[];
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState<Order[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; events: DayEvent } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersSnapshot, vacationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'vacations'))
      ]);

      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      const vacationsData = vacationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vacation[];

      setOrders(ordersData);
      setVacations(vacationsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const dateTime = date.getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return dateTime >= start && dateTime <= end;
  };

  const getEventsForDay = (day: number): DayEvent => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];

    const orderPlaced = orders.filter(order => {
      if (!order.createdAt?.seconds) return false;
      const orderDate = new Date(order.createdAt.seconds * 1000);
      return orderDate.toISOString().split('T')[0] === dateStr;
    });

    const deliveries = orders.filter(order => {
      return order.deliveryDate === dateStr;
    });

    const dayVacations = vacations.filter(vacation => {
      return isDateInRange(date, vacation.startDate, vacation.endDate);
    });

    return { orderPlaced, deliveries, vacations: dayVacations };
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading) {
    return <div className="loading">Chargement du calendrier...</div>;
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>📅 Calendrier</h2>
        <div className="calendar-controls">
          <button onClick={previousMonth} className="btn btn-secondary btn-sm">← Précédent</button>
          <button onClick={goToToday} className="btn btn-primary btn-sm">Aujourd'hui</button>
          <button onClick={nextMonth} className="btn btn-secondary btn-sm">Suivant →</button>
        </div>
      </div>

      <div className="calendar-month-year">
        <select 
          value={currentMonth} 
          onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
          className="month-select"
        >
          {monthNames.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>
        <select 
          value={currentYear} 
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="year-select"
        >
          {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="calendar-legends">
        <div className="legend-item">
          <span className="legend-dot order-placed"></span>
          <span>Commande passée</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot delivery"></span>
          <span>Livraison</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot vacation"></span>
          <span>Congés</span>
        </div>
      </div>

      <div className="custom-calendar">
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}
          
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const events = getEventsForDay(day);
            const hasEvents = events.orderPlaced.length > 0 || events.deliveries.length > 0 || events.vacations.length > 0;
            const isToday = isCurrentMonth && today.getDate() === day;

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                onClick={() => hasEvents && setSelectedDay({ date: new Date(currentYear, currentMonth, day), events })}
              >
                <div className="day-number">{day}</div>
                <div className="day-indicators">
                  {events.orderPlaced.length > 0 && (
                    <span className="indicator order-placed" title={`${events.orderPlaced.length} commande(s) passée(s)`}>
                      {events.orderPlaced.length}
                    </span>
                  )}
                  {events.deliveries.length > 0 && (
                    <span className="indicator delivery" title={`${events.deliveries.length} livraison(s)`}>
                      🚚 {events.deliveries.length}
                    </span>
                  )}
                  {events.vacations.length > 0 && (
                    <span className="indicator vacation" title="Congés">🏖️</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="event-details-modal" onClick={() => setSelectedDay(null)}>
          <div className="event-details" onClick={(e) => e.stopPropagation()}>
            <h3>📅 {selectedDay.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            
            {selectedDay.events.orderPlaced.length > 0 && (
              <div className="event-section">
                <h4>📝 Commandes passées ({selectedDay.events.orderPlaced.length})</h4>
                {selectedDay.events.orderPlaced.map(order => (
                  <div key={order.id} className="event-item">
                    <p><strong>{order.userEmail}</strong></p>
                    <p>Total: {order.total.toFixed(2)}€ - Statut: {order.status}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedDay.events.deliveries.length > 0 && (
              <div className="event-section">
                <h4>🚚 Livraisons ({selectedDay.events.deliveries.length})</h4>
                {selectedDay.events.deliveries.map(order => (
                  <div key={order.id} className="event-item">
                    <p><strong>{order.userEmail}</strong></p>
                    <p>Total: {order.total.toFixed(2)}€ - Statut: {order.status}</p>
                    {order.notes && <p className="notes">{order.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {selectedDay.events.vacations.length > 0 && (
              <div className="event-section">
                <h4>🏖️ Congés</h4>
                {selectedDay.events.vacations.map(vacation => (
                  <div key={vacation.id} className="event-item">
                    <p><strong>{vacation.reason || 'Congés'}</strong></p>
                    <p>Du {new Date(vacation.startDate).toLocaleDateString('fr-FR')} au {new Date(vacation.endDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setSelectedDay(null)} className="btn btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
