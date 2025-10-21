// Frontend/src/Dashboard/psychology/PsychologyDashboard.jsx
import { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';

const PsychologyDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
          setError('No autenticado');
          setLoading(false);
          return;
        }
        const response = await fetch(`${BASE_URL}/psychology/dashboard`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const result = await response.json();
        if (response.status === 401) {
          // Token inválido/expirado
          setError(result.message || 'Sesión expirada');
          // Opcional: redirigir a login después de un breve delay
          setTimeout(() => navigate('/login'), 1000);
          return;
        }
        if (!response.ok) throw new Error(result.message);
        setDashboardData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const { totalPatients, activePatients, todaySessions, riskAlerts } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Dashboard Psicológico</h1>
        <p className="text-textColor mt-2">Gestión clínica basada en TCC</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pacientes</p>
              <p className="text-3xl font-bold text-primaryColor mt-2">{totalPatients || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-primaryColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pacientes Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{activePatients || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sesiones Hoy</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{todaySessions?.length || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de riesgo */}
      {riskAlerts && riskAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Alertas de Riesgo Activas</h3>
          </div>
          <ul className="space-y-2">
            {riskAlerts.map((alert) => (
              <li key={alert._id} className="text-red-700">
                <span className="font-medium">{alert.patient?.personalInfo?.fullName}</span> - {alert.riskAlert.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sesiones de hoy */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-headingColor mb-4">Sesiones Programadas Hoy</h2>
        {todaySessions && todaySessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Paciente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sesión #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Modalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todaySessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{session.patient?.personalInfo?.fullName}</td>
                    <td className="px-4 py-3">{new Date(session.sessionDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3">#{session.sessionNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.modality === 'online' ? 'bg-blue-100 text-blue-800' :
                        session.modality === 'phone' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.modality === 'online' ? 'Online' : session.modality === 'phone' ? 'Teléfono' : 'Presencial'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay sesiones programadas para hoy</p>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/psychology/clinical-history" 
          className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-semibold">Historias Clínicas</p>
        </Link>

        <Link 
          to="/psychology/patients/new" 
          className="bg-primaryColor text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-all text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="font-semibold">Nuevo Paciente</p>
        </Link>

        <Link 
          to="/psychology/patients" 
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-all text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-semibold">Ver Pacientes</p>
        </Link>

        <Link 
          to="/psychology/sessions/new" 
          className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition-all text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="font-semibold">Nueva Sesión</p>
        </Link>

        <Link 
          to="/psychology/assessments/new" 
          className="bg-orange-600 text-white p-6 rounded-lg shadow-md hover:bg-orange-700 transition-all text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="font-semibold">Nueva Evaluación</p>
        </Link>
      </div>
    </div>
  );
};

export default PsychologyDashboard;
