import React, { useEffect, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const MyBookings = () => {
  const {
    data: calendarData,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/calendar/events`);

  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    if (Array.isArray(calendarData) && calendarData.length > 0) {
      const events = calendarData.map((event) => ({
        id: event.id,
        title: event.summary || "Sin título",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
      }));
      setCalendarEvents(events);
    } else if (calendarData) {
      setCalendarEvents([]); // Asegurarse de que esté vacío si no hay datos
    }
  }, [calendarData]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {loading && <Loading />}

      {error && <Error errMessage={error} />}

      {!loading && !error && calendarEvents.length === 0 && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          No tienes eventos registrados en tu Google Calendar
        </h2>
      )}

      {!loading && !error && calendarEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primaryColor">
            Mis citas agendadas 
          </h2>

          <div className="bg-white rounded-md shadow-md p-4 mb-10">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              locale="es"
              height="auto"
              eventColor="#0b89da"
              eventTextColor="#ffffff"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;