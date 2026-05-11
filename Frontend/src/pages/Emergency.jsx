import React from 'react';
import { Link } from 'react-router-dom';

const Emergency = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Emergencia Psicológica</h1>
          <p className="mt-4 text-lg text-gray-600">
            Si estás experimentando una crisis psicológica, necesitas atención inmediata.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h2 className="text-xl font-semibold text-red-800">Línea de Atención en Salud Mental</h2>
              <p className="mt-2 text-red-700">Llama al <a href="tel:106" className="font-bold underline">106</a> para atención inmediata</p>
              <p className="mt-2 text-red-600 text-sm">Disponible las 24 horas, todos los días</p>
            </div>
            
            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-800">Emergencias Psiquiátricas</h2>
              <p className="mt-2 text-yellow-700">Dirígete al hospital más cercano o llama al <a href="tel:123" className="font-bold underline">123</a></p>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800">Centro de Atención Primaria</h2>
              <p className="mt-2 text-blue-700">Consulta en tu EPS o IPS más cercana</p>
            </div>
          </div>
          
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al Inicio
            </Link>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Recuerda: Tu bienestar es lo más importante. No estás solo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;