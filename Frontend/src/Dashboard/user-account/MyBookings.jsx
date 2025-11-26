import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("calendar"); // calendar | list

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'No se pudieron cargar las citas');
      }

      const bookingsData = result.data || [];
      setBookings(bookingsData);

      // Convertir bookings a eventos del calendario
      const events = bookingsData.map((booking) => ({
        id: booking._id,
        title: `${booking.doctor?.name || 'Médico'} - ${booking.reason || 'Cita médica'}`,
        start: booking.appointmentDate,
        end: new Date(new Date(booking.appointmentDate).getTime() + 30 * 60 * 1000).toISOString(),
        backgroundColor: booking.calendarEventId ? "#0b89da" : "#9ca3af",
        borderColor: booking.calendarEventId ? "#0b89da" : "#9ca3af",
      }));

      setCalendarEvents(events);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'No se pudo cancelar la cita');
      }

      toast.success("Cita cancelada exitosamente");
      fetchBookings(); // Recargar la lista
    } catch (err) {
      console.error("Error al cancelar cita:", err);
      toast.error(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error errMessage={error} />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primaryColor">Mis Citas Médicas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg ${
              view === "calendar"
                ? "bg-primaryColor text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📅 Calendario
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg ${
              view === "list"
                ? "bg-primaryColor text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📋 Lista
          </button>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tienes citas médicas agendadas</p>
        </div>
      )}

      {/* Vista de Calendario */}
      {view === "calendar" && bookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#0b89da]"></div>
              <span>Sincronizado con Google Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-400"></div>
              <span>Solo en Medicare</span>
            </div>
          </div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            events={calendarEvents}
            locale="es"
            height="auto"
            eventTextColor="#ffffff"
          />
        </div>
      )}

      {/* Vista de Lista */}
      {view === "list" && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  {/* Doctor Photo */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {booking.doctor?.photo ? (
                      <img
                        src={booking.doctor.photo}
                        alt={booking.doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        👨‍⚕️
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-headingColor">
                          {booking.doctor?.name || "Doctor no especificado"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.doctor?.specialization || "Especialidad no especificada"}
                        </p>
                      </div>
                      {booking.calendarEventId ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                          ✓ Sincronizado con Google
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Solo en Medicare
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Fecha:</span>
                        <span>{new Date(booking.appointmentDate).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🕐 Hora:</span>
                        <span>{new Date(booking.appointmentDate).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}</span>
                      </div>
                      {booking.reason && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium">📝 Motivo:</span>
                          <span>{booking.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
