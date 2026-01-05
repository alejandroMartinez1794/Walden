import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../config';

const AgendaPanel = ({ appointments, doctorProfile, token, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patientEmail: '',
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    motivo: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [showPatientResults, setShowPatientResults] = useState(false);

  // Search Patients
  const handleSearchPatients = async (query) => {
    setPatientSearchQuery(query);
    if (query.length < 2) {
      setPatientResults([]);
      setShowPatientResults(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/users/patients/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setPatientResults(result.data);
        setShowPatientResults(true);
      }
    } catch (err) {
      console.error("Error searching patients", err);
    }
  };

  const handleSelectPatient = (patient) => {
    setBookingForm(prev => ({
      ...prev,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email
    }));
    setPatientSearchQuery(patient.name);
    setShowPatientResults(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: doctorProfile?._id,
          patientId: bookingForm.patientId,
          patientEmail: bookingForm.patientEmail,
          patientName: bookingForm.patientName,
          date: bookingForm.date,
          time: bookingForm.time,
          motivoConsulta: bookingForm.motivo,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success('Cita agendada exitosamente');
      setBookingForm({ patientEmail: '', patientId: '', patientName: '', date: '', time: '', motivo: '' });
      setPatientSearchQuery('');
      setShowBookingForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const normalizeSearch = search.trim().toLowerCase();
  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === 'upcoming' && apt.status !== 'approved') return false;
      if (filter === 'completed' && apt.status !== 'completed') return false;
      if (filter === 'cancelled' && apt.status !== 'cancelled') return false;
      if (normalizeSearch) {
        const candidate = `${apt.user?.name || ''} ${apt.user?.email || ''}`.toLowerCase();
        return candidate.includes(normalizeSearch);
      }
      return true;
    })
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const statusStyles = {
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-[#09152c] text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'upcoming' ? 'Próximas' : f === 'completed' ? 'Completadas' : 'Canceladas'}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden md:inline">Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Formulario de Nueva Cita (Expandible) */}
      {showBookingForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Agendar Nueva Sesión</h3>
          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <input
                type="text"
                value={patientSearchQuery}
                onChange={(e) => handleSearchPatients(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Buscar por nombre..."
                required
              />
              {showPatientResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {patientResults.map(p => (
                    <div 
                      key={p._id} 
                      onClick={() => handleSelectPatient(p)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={bookingForm.time}
                onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <select
                value={bookingForm.motivo}
                onChange={(e) => setBookingForm({...bookingForm, motivo: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Sesión de seguimiento">Sesión de seguimiento</option>
                <option value="Primera consulta">Primera consulta</option>
                <option value="Urgencia">Urgencia</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {bookingSubmitting ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Citas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {apt.user?.name?.charAt(0) || 'P'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{apt.user?.name || 'Paciente'}</div>
                          <div className="text-xs text-gray-500">{apt.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="text-xs text-gray-500">{apt.appointmentTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{apt.motivoConsulta || 'Consulta General'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusStyles[apt.status] || 'bg-gray-100 text-gray-800'}`}>
                        {apt.status === 'approved' ? 'Confirmada' : apt.status === 'completed' ? 'Completada' : apt.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron citas con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgendaPanel;
