import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, CalendarEvent } from '../../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      const calendarEvents: CalendarEvent[] = orders.map(order => {
        const orderDate = order.deliveryDate 
          ? new Date(order.deliveryDate)
          : order.createdAt?.seconds 
            ? new Date(order.createdAt.seconds * 1000)
            : new Date();

        return {
          id: order.id,
          title: `${order.userEmail} - ${order.total.toFixed(2)}€ (${order.status})`,
          start: orderDate,
          end: orderDate,
          orderId: order.id,
          type: 'order'
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erreur lors du chargement du calendrier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: '#667eea',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  if (loading) {
    return <div className="loading">Chargement du calendrier...</div>;
  }

  return (
    <div className="calendar-view">
      <h2>📅 Calendrier des Commandes</h2>
      
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucune commande dans cette période"
          }}
        />
      </div>

      {selectedEvent && (
        <div className="event-details-modal" onClick={() => setSelectedEvent(null)}>
          <div className="event-details" onClick={(e) => e.stopPropagation()}>
            <h3>Détails de la commande</h3>
            <p><strong>Date:</strong> {format(selectedEvent.start, 'PPP', { locale: fr })}</p>
            <p><strong>Info:</strong> {selectedEvent.title}</p>
            <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
