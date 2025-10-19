// src/components/dashboard/patient/MyCalendar.jsx

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:5000/api/v1/calendar/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const formattedEvents = Array.isArray(data.data)
            ? data.data.map(event => ({
                id: event.id,
                title: event.summary || "Sin título",
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
              }))
            : [];

          setEvents(formattedEvents);
          console.log("📥 Datos recibidos del backend:", formattedEvents);
        } else {
          console.error("Error en la respuesta:", data.error || data.message);
          setError(data.error || data.message || "Error al obtener eventos");
        }
      } catch (error) {
        console.error("Error al obtener eventos del calendario:", error);
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Mis Citas</h2>

      {loading && <p>Cargando eventos...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500">No tienes eventos registrados en tu Google Calendar</p>
      )}

      {!loading && !error && events.length > 0 && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          height="auto"
          locale="es"
          eventColor="#0b89da"
          eventTextColor="#ffffff"
        />
      )}
    </div>
  );
};

export default MyCalendar;