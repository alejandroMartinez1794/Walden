import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BASE_URL, token } from "../../config"; // Asegúrate de que BASE_URL y token estén configurados correctamente
import { formateDate } from "../../utils/formateDate";

function Appointments() {
    const [appointments, setAppointments] = useState([]); // Lista de citas
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [filters, setFilters] = useState({
        date: "",
        patient: "",
        status: "",
    }); // Filtros
    const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha seleccionada en el calendario

    // Obtener citas desde el backend
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch(`${BASE_URL}/doctors/appointments`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Enviar el token en los headers
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message); // Manejar errores del backend
                setAppointments(data); // Guardar las citas en el estado
            } catch (err) {
                setError(err.message); // Guardar el error en el estado
            } finally {
                setLoading(false); // Finalizar el estado de carga
            }
        };

        fetchAppointments();
    }, []);

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Filtrar citas según los filtros seleccionados
    const filteredAppointments = appointments.filter((appointment) => {
        return (
            (!filters.date || appointment.date.includes(filters.date)) &&
            (!filters.patient || appointment.user.name.toLowerCase().includes(filters.patient.toLowerCase())) &&
            (!filters.status || (filters.status === "paid" ? appointment.isPaid : !appointment.isPaid))
        );
    });

    // Confirmar una cita
    const handleConfirm = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/doctors/appointments/${id}/confirm`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment._id === id ? { ...appointment, status: "confirmed" } : appointment
                )
            );
        } catch (err) {
            alert("Error al confirmar la cita: " + err.message);
        }
    };

    // Cancelar una cita
    const handleCancel = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/doctors/appointments/${id}/cancel`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment._id === id ? { ...appointment, status: "cancelled" } : appointment
                )
            );
        } catch (err) {
            alert("Error al cancelar la cita: " + err.message);
        }
    };

    // Reprogramar una cita
    const handleReschedule = async (id) => {
        const newDate = prompt("Ingrese la nueva fecha (YYYY-MM-DD):");
        if (!newDate) return;

        try {
            const response = await fetch(`${BASE_URL}/doctors/appointments/${id}/reschedule`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date: newDate }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment._id === id ? { ...appointment, date: newDate } : appointment
                )
            );
        } catch (err) {
            alert("Error al reprogramar la cita: " + err.message);
        }
    };

    // Mostrar estado de carga o error
    if (loading) return <p>Cargando citas...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Citas Programadas</h2>

            {/* Filtros */}
            <div className="mb-4 flex gap-4">
                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />
                <input
                    type="text"
                    name="patient"
                    placeholder="Buscar por paciente"
                    value={filters.patient}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="">Todos los estados</option>
                    <option value="paid">Pagadas</option>
                    <option value="unpaid">No Pagadas</option>
                </select>
            </div>

            {/* Calendario */}
            <div className="mb-4">
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    className="mb-4"
                />
                <p>Citas para: {selectedDate.toDateString()}</p>
            </div>

            {/* Tabla de Citas */}
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Gender</th>
                        <th scope="col" className="px-6 py-3">Payment</th>
                        <th scope="col" className="px-6 py-3">Price</th>
                        <th scope="col" className="px-6 py-3">Booked On</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAppointments.map((item) => (
                        <tr key={item._id}>
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                <img src={item.user.photo} className="w-10 h-10 rounded-full" alt="" />
                                <div className="pl-3">
                                    <div className="text-base font-semibold">{item.user.name}</div>
                                    <div className="text-normal text-gray-500">{item.user.email}</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">{item.user.gender}</td>
                            <td className="px-6 py-4">
                                {item.isPaid ? (
                                    <div className="flex items-center">
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                                        Paid
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                                        Unpaid
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">{item.ticketPrice}</td>
                            <td className="px-6 py-4">{formateDate(item.createdAt)}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleConfirm(item._id)}
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => handleCancel(item._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleReschedule(item._id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Reprogramar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Appointments;