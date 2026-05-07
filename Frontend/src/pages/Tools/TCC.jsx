import React from 'react';
import { Link } from 'react-router-dom';

const TCC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herramientas de Terapia Cognitivo-Conductual</h1>
          <p className="text-gray-600">
            Aquí encontrarás diversas herramientas terapéuticas para complementar tu proceso de tratamiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Thought Record */}
          <Link to="/psychology/assessments/cbt/thought-record" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Registro de Pensamientos</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Identifica pensamientos negativos automáticos y desarrolla pensamientos alternativos equilibrados
              </p>
            </div>
          </Link>

          {/* Cognitive Distortions */}
          <Link to="/psychology/assessments/cbt/distortions" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Distorsiones Cognitivas</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Aprende a identificar y corregir distorsiones cognitivas comunes
              </p>
            </div>
          </Link>

          {/* Core Beliefs */}
          <Link to="/psychology/assessments/cbt/core-beliefs" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Creencias Centrales</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Explora y reformula creencias centrales disfuncionales
              </p>
            </div>
          </Link>

          {/* SUDS Form */}
          <Link to="/psychology/assessments/cbt/suds" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Escala SUDS</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Mide y monitorea niveles de ansiedad/anxiety en situaciones específicas
              </p>
            </div>
          </Link>

          {/* Behavioral Activation */}
          <Link to="/psychology/assessments/cbt/behavioral-activation" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Activación Conductual</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Incrementa comportamientos positivos y placenteros
              </p>
            </div>
          </Link>

          {/* Avoidance Behaviors */}
          <Link to="/psychology/assessments/cbt/avoidance" className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">Confrontar Evitaciones</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Identifica y enfrenta comportamientos de evitación
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">¿Necesitas Ayuda Inmediata?</h2>
          <p className="text-blue-700 mb-4">
            Si estás experimentando una crisis psicológica, llama al número de emergencia: 
            <a href="tel:106" className="font-bold ml-1 underline">106</a>
          </p>
          <Link 
            to="/emergency" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Acceder a Recursos de Emergencia
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TCC;