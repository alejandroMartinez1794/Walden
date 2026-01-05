import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const OverviewPanel = ({ dashboardData, cbtOverview, doctorProfile, quickActions, assessmentShortcuts }) => {
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header de Bienvenida */}
      <div className="bg-gradient-to-r from-[#09152c] to-[#1a2b4a] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Hola, Dr. {doctorProfile?.name?.split(' ')[0] || 'Psicólogo'}
            </h2>
            <p className="text-blue-200 text-lg">
              Tienes <span className="font-bold text-white">{dashboardData?.todaySessions || 0}</span> sesiones programadas para hoy.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">{dashboardData?.activePatients || 0}</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Pacientes Activos</p>
            </div>
            <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">{dashboardData?.riskAlerts || 0}</p>
              <p className="text-xs text-rose-300 uppercase tracking-wider">Alertas de Riesgo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className={`group relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className={`mb-4 text-transparent bg-clip-text bg-gradient-to-br ${action.gradient}`}>
              {action.icon}
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{action.title}</h3>
            <p className="text-xs text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Métricas TCC y Accesos Directos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Progreso TCC */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Evolución Clínica (TCC)</h3>
            <select className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cbtOverview?.monthlyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Legend />
                <Bar dataKey="improvement" name="Mejoría Significativa" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stable" name="Estable" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accesos Directos a Evaluaciones */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Evaluaciones Rápidas</h3>
          <div className="space-y-3">
            {assessmentShortcuts.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.subtitle}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link to="/psychology/assessments" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-2">
              Ver biblioteca completa
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
