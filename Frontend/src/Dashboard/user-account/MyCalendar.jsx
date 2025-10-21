// src/components/dashboard/patient/MyCalendar.jsx

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BASE_URL } from '../../config';

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError('No se encontró token de autenticación');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/calendar/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsGoogleConnected(true);
        const formattedEvents = Array.isArray(data.data)
          ? data.data.map(event => ({
              id: event.id,
              title: event.summary || "Sin título",
              start: event.start?.dateTime || event.start?.date,
              end: event.end?.dateTime || event.end?.date,
            }))
          : [];

        setEvents(formattedEvents);
        console.log("📥 Eventos de Google Calendar:", formattedEvents);
      } else {
        // Si el error es 401 o indica falta de token de Google
        if (response.status === 401 || data.error?.includes('token')) {
          setIsGoogleConnected(false);
          setError('No has conectado tu cuenta de Google Calendar');
        } else {
          setError(data.error || data.message || "Error al obtener eventos");
        }
      }
    } catch (error) {
      console.error("Error al obtener eventos del calendario:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || BASE_URL;
    window.location.href = `${backendUrl}/calendar/google-auth`;
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Mi Calendario de Google</h2>
        {!isGoogleConnected && !loading && (
          <button
            onClick={handleConnectGoogle}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Conectar Google Calendar
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-500">Cargando eventos...</p>}
      
      {error && !isGoogleConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-800">
            <strong>ℹ️ Cuenta de Google no conectada</strong>
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Conecta tu cuenta de Google para sincronizar tus citas médicas con Google Calendar.
          </p>
          <button
            onClick={handleConnectGoogle}
            className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Conectar ahora
          </button>
        </div>
      )}

      {error && isGoogleConnected && (
        <p className="text-red-500">Error: {error}</p>
      )}

      {!loading && !error && events.length === 0 && isGoogleConnected && (
        <p className="text-gray-500 text-center py-8">No tienes eventos registrados en tu Google Calendar</p>
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
