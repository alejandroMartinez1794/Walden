import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import { HiOutlineCalendar, HiOutlineClipboardList } from "react-icons/hi";

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineCalendar className="h-7 w-7" />
            </div>
            <div className="max-w-2xl space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Citas</p>
              <h2 className="text-2xl font-semibold leading-tight text-slate-900 text-pretty">Mis Citas Médicas</h2>
              <p className="text-sm leading-relaxed text-slate-600 text-pretty">
                Cambia entre calendario y lista para ubicar tu próxima sesión.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setView("calendar")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                view === "calendar"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
              type="button"
            >
              <HiOutlineCalendar className="text-lg" />
              Calendario
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                view === "list"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
              type="button"
            >
              <HiOutlineClipboardList className="text-lg" />
              Lista
            </button>
          </div>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900/10 text-slate-900">
            <HiOutlineCalendar className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Aún no tienes citas agendadas</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 text-pretty">
            Cuando reserves una sesión, aparecerá aquí para que la tengas siempre a mano.
          </p>
        </div>
      )}

      {/* Vista de Calendario */}
      {view === "calendar" && bookings.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              <HiOutlineCalendar className="text-base" />
              Vista calendario
            </span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#0b89da]"></div>
              <span>Sincronizado con Google Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-400"></div>
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
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl transition-shadow hover:shadow-2xl backdrop-blur"
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
