import React, { useEffect, useState, useContext } from "react";
import { authContext } from "../../context/AuthContext";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import ErrorMessage from "../../components/Error/Error";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import { HiOutlineCalendar, HiOutlineClipboardList, HiBadgeCheck, HiCurrencyDollar } from "react-icons/hi";
import PaymentButton from "../../components/Payment/PaymentButton";

const MyBookings = () => {
  const { token, dispatch } = useContext(authContext);
  const [bookings, setBookings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!token) {
           const sessionToken = sessionStorage.getItem('token');
           if (!sessionToken) throw new Error("No autenticado");
      }
      
      const activeToken = token || sessionStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
         if (response.status === 401) {
            dispatch({ type: "LOGOUT" });
         }
        throw new Error(result.error || result.message || 'No se pudieron cargar las citas');
      }

      const bookingsData = result.data || [];
      setBookings(bookingsData);

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
      fetchBookings(); 
    } catch (err) {
      console.error("Error al cancelar cita:", err);
      toast.error(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage errMessage={error} />;

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
                Gestiona tus citas y realiza tus pagos aquí.
                </p>
            </div>
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

      {/* 1. VISTA DE LISTA (Prioridad para Pagos) */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800 ml-2">Tus Citas Pendientes</h3>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl transition-shadow hover:shadow-2xl backdrop-blur relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-slate-100">
                    {booking.doctor?.photo ? (
                      <img
                        src={booking.doctor.photo}
                        alt={booking.doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👨‍⚕️
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {booking.doctor?.name || "Doctor no especificado"}
                        </h3>
                        <p className="text-sm font-medium text-primaryColor">
                          {booking.doctor?.specialization || "Especialidad no especificada"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {booking.calendarEventId ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 border border-blue-200">
                            ✓ Sincronizado
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                            Local
                            </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200/60 inline-flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <span className="font-semibold text-slate-700">
                                {new Date(booking.appointmentDate).toLocaleDateString("es-ES", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                })}
                            </span>
                         </div>
                         <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200/60 inline-flex items-center gap-2">
                            <span className="text-lg">⏰</span>
                            <span className="font-semibold text-slate-700">
                                {new Date(booking.appointmentDate).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true
                                })}
                            </span>
                         </div>
                      </div>
                      
                      {booking.reason && (
                        <div className="text-slate-600 italic bg-yellow-50/50 p-2 rounded border border-yellow-100/50 text-sm">
                          "{booking.reason}"
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {booking.isPaid ? (
                           <div className="flex items-center gap-3 text-green-700 bg-green-50 px-5 py-3 rounded-xl border border-green-200 shadow-sm w-full sm:w-auto justify-center">
                              <HiBadgeCheck className="text-2xl" />
                              <span className="font-bold tracking-wide">PAGO CONFIRMADO</span>
                           </div>
                        ) : (
                          <div className="w-full flex-1">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between bg-white p-1 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100/50">
                                  <HiCurrencyDollar className="text-xl" />
                                  <span className="font-medium text-sm lg:text-base">Monto a pagar:</span>
                                  <span className="font-bold text-lg text-slate-900">${booking.ticketPrice || 50000}</span>
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <PaymentButton 
                                        bookingId={booking._id} 
                                        amount={booking.ticketPrice || 50000} 
                                    />
                                </div>
                             </div>
                          </div>
                        )}
                        
                        {!booking.isPaid && (
                            <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ml-auto"
                            >
                                Cancelar Cita
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. VISTA DE CALENDARIO (Secundaria) */}
      {bookings.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur mt-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <HiOutlineCalendar className="text-primaryColor" />
            Vista Mensual
          </h3>
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#0b89da] shadow-sm shadow-blue-200"></div>
              <span className="font-medium">Sincronizado (Google)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#9ca3af] shadow-sm"></div>
              <span className="font-medium">Cita Local</span>
            </div>
          </div>
          <div className="booking-calendar-wrapper">
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
                eventDisplay="block"
                dayMaxEvents={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
