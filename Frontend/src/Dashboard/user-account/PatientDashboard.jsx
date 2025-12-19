// Frontend/src/Dashboard/user-account/PatientDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PatientDashboard = ({ userData, bookingsCount = 0 }) => {
  const upcomingAppointments = bookingsCount; // En producción vendría del backend
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {userData?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-blue-100">Gestiona tu salud de manera inteligente</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Citas Próximas</p>
              <p className="text-2xl font-bold text-gray-800">{upcomingAppointments}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tipo de Sangre</p>
              <p className="text-2xl font-bold text-gray-800">{userData?.bloodType || 'N/D'}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Edad</p>
              <p className="text-2xl font-bold text-gray-800">{userData?.age || 'N/D'}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Género</p>
              <p className="text-2xl font-bold text-gray-800">{userData?.gender || 'N/D'}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primaryColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/services"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-500 transition-all">
              <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-green-700">Ver Servicios</h3>
              <p className="text-sm text-gray-500">Servicios médicos</p>
            </div>
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-500 transition-all">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-purple-700">Contacto</h3>
              <p className="text-sm text-gray-500">Soporte médico</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Consejos de Salud del Día
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Hidratación</h3>
                <p className="text-sm text-gray-600">Bebe al menos 8 vasos de agua al día para mantener tu cuerpo hidratado.</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚶</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Ejercicio</h3>
                <p className="text-sm text-gray-600">30 minutos de actividad física diaria mejora tu salud cardiovascular.</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">😴</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Descanso</h3>
                <p className="text-sm text-gray-600">Duerme 7-8 horas diarias para una recuperación óptima.</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥗</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Nutrición</h3>
                <p className="text-sm text-gray-600">Incluye frutas y verduras en cada comida para vitaminas esenciales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <h2 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Contacto de Emergencia
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Emergencias Médicas:</span> 911
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Línea Directa Hospital:</span> (555) 123-4567
            </p>
          </div>
          <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md">
            Llamar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
