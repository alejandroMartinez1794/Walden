// Frontend/src/Dashboard/doctor-account/DoctorInsightsElite.jsx
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { toast } from 'react-toastify';

const DoctorInsightsElite = () => {
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    completedSessions: 0,
    canceledAppointments: 0,
    revenue: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [cbt, setCbt] = useState(null); // CBT overview data
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch doctor profile with appointments
      const profileRes = await fetch(`${BASE_URL}/doctors/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      if (profileRes.ok && profileData.data) {
        const doctor = profileData.data;
        const appts = doctor.appointments || [];
        
        setAppointments(appts);
        
        // Calculate stats
        const completed = appts.filter(a => a.status === 'completed').length;
        const canceled = appts.filter(a => a.status === 'cancelled').length;
        
        // Unique patients
        const uniquePatients = new Set(appts.map(a => a.user?._id || a.user).filter(Boolean));
        
        // Revenue calculation (assuming $100 per session)
        const revenue = completed * 100;
        
        setStats({
          totalPatients: uniquePatients.size,
          activePatients: uniquePatients.size, // Simplified
          totalAppointments: appts.length,
          completedSessions: completed,
          canceledAppointments: canceled,
          revenue: revenue,
          averageRating: doctor.averageRating || 0,
          totalReviews: doctor.totalRating || 0,
        });
      }

      // Fetch CBT overview
      const cbtRes = await fetch(`${BASE_URL}/psychology/dashboard/cbt-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cbtJson = await cbtRes.json();
      if (cbtRes.ok) {
        setCbt(cbtJson.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
      setLoading(false);
    }
  };

  // Mock data for charts - In production, calculate from real appointments
  const appointmentTrendData = [
    { name: 'Ene', citas: 12, completadas: 10, canceladas: 2 },
    { name: 'Feb', citas: 19, completadas: 16, canceladas: 3 },
    { name: 'Mar', citas: 15, completadas: 13, canceladas: 2 },
    { name: 'Abr', citas: 22, completadas: 20, canceladas: 2 },
    { name: 'May', citas: 28, completadas: 25, canceladas: 3 },
    { name: 'Jun', citas: 24, completadas: 22, canceladas: 2 },
  ];

  const revenueData = [
    { name: 'Ene', ingresos: 1200, gastos: 400, neto: 800 },
    { name: 'Feb', ingresos: 1900, gastos: 500, neto: 1400 },
    { name: 'Mar', ingresos: 1500, gastos: 450, neto: 1050 },
    { name: 'Abr', ingresos: 2200, gastos: 600, neto: 1600 },
    { name: 'May', ingresos: 2800, gastos: 700, neto: 2100 },
    { name: 'Jun', ingresos: 2400, gastos: 650, neto: 1750 },
  ];

  const patientDistribution = [
    { name: 'Ansiedad', value: 35, color: '#3B82F6' },
    { name: 'Depresión', value: 28, color: '#8B5CF6' },
    { name: 'Estrés', value: 20, color: '#10B981' },
    { name: 'TCC', value: 12, color: '#F59E0B' },
    { name: 'Otros', value: 5, color: '#6B7280' },
  ];

  const performanceMetrics = [
    { metric: 'Puntualidad', value: 95 },
    { metric: 'Satisfacción', value: 92 },
    { metric: 'Efectividad', value: 88 },
    { metric: 'Comunicación', value: 94 },
    { metric: 'Profesionalismo', value: 96 },
  ];

  const hourlyDistribution = [
    { hour: '8-10am', sessions: 8 },
    { hour: '10-12pm', sessions: 15 },
    { hour: '12-2pm', sessions: 5 },
    { hour: '2-4pm', sessions: 18 },
    { hour: '4-6pm', sessions: 12 },
    { hour: '6-8pm', sessions: 6 },
  ];

  const upcomingAppointments = appointments
    .filter(a => a.status === 'approved' && new Date(a.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  const recentPatients = appointments
    .filter(a => a.user)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 6)
    .map(a => ({
      name: a.user?.name || 'Paciente',
      email: a.user?.email || '',
      lastVisit: a.appointmentDate,
      status: a.status,
    }));

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primaryColor"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard Profesional
            </h1>
            <p className="text-purple-100 text-lg">Vista integral de tu práctica médica</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {range === 'week' && 'Semana'}
                {range === 'month' && 'Mes'}
                {range === 'quarter' && 'Trimestre'}
                {range === 'year' && 'Año'}
              </button>
            ))}
            <button
              onClick={async () => {
                try {
                  setSeeding(true);
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${BASE_URL}/psychology/dashboard/seed-demo`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    toast.success('Datos demo TCC cargados');
                    fetchDashboardData();
                  } else {
                    const j = await res.json();
                    toast.error(j.message || 'No se pudo cargar demo');
                  }
                } catch (e) {
                  toast.error('Error cargando demo');
                } finally {
                  setSeeding(false);
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${seeding ? 'bg-white/40' : 'bg-white text-indigo-700 shadow-lg hover:bg-indigo-50'}`}
              disabled={seeding}
            >
              {seeding ? 'Cargando demo…' : 'Cargar datos demo TCC'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-blue-100 text-sm font-medium mb-1">Total Pacientes</h3>
          <p className="text-4xl font-bold">{stats.totalPatients}</p>
          <p className="text-blue-100 text-xs mt-2">Activos: {stats.activePatients}</p>
        </div>

        {/* Appointments */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+8%</span>
          </div>
          <h3 className="text-purple-100 text-sm font-medium mb-1">Citas Totales</h3>
          <p className="text-4xl font-bold">{stats.totalAppointments}</p>
          <p className="text-purple-100 text-xs mt-2">Completadas: {stats.completedSessions}</p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+24%</span>
          </div>
          <h3 className="text-green-100 text-sm font-medium mb-1">Ingresos</h3>
          <p className="text-4xl font-bold">${stats.revenue.toLocaleString()}</p>
          <p className="text-green-100 text-xs mt-2">Este período</p>
        </div>

        {/* Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Excelente</span>
          </div>
          <h3 className="text-orange-100 text-sm font-medium mb-1">Calificación</h3>
          <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
          <p className="text-orange-100 text-xs mt-2">{stats.totalReviews} reseñas</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Tendencia de Citas
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appointmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="citas" stroke="#3B82F6" strokeWidth={3} name="Total" />
              <Line type="monotone" dataKey="completadas" stroke="#10B981" strokeWidth={3} name="Completadas" />
              <Line type="monotone" dataKey="canceladas" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Canceladas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Análisis Financiero
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="ingresos" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
              <Area type="monotone" dataKey="gastos" stroke="#EF4444" fillOpacity={1} fill="url(#colorGastos)" name="Gastos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CBT Row 1: Severity Trends and Cognitive Distortions */}
      {cbt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 12h2m-2 4h2m7 4H4a2 2 0 01-2-2V6a2 2 0 012-2h7l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              Tendencia de Severidad (TCC)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={(cbt.severityTrends.labels || []).map((label, i) => ({
                name: label,
                phq9: cbt.severityTrends.phq9[i],
                bdi2: cbt.severityTrends.bdi2[i],
                gad7: cbt.severityTrends.gad7[i],
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="phq9" stroke="#3B82F6" strokeWidth={3} name="PHQ-9" />
                <Line type="monotone" dataKey="bdi2" stroke="#8B5CF6" strokeWidth={3} name="BDI-II" />
                <Line type="monotone" dataKey="gad7" stroke="#10B981" strokeWidth={3} name="GAD-7" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cognitive Distortions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Distorsiones Cognitivas (últ. 60 días)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(cbt.distortions || []).map(d => ({ name: d.name, count: d.value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} angle={-20} textAnchor="end" interval={0} />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8,8,0,0]} name="Frecuencia" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

  {/* Charts Row 2 */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Distribución de Casos
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={patientDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {patientDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar / Homework Adherence */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Adherencia a Tareas TCC
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-3xl font-bold text-indigo-700">{cbt?.homeworkAdherence?.completed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-800">{cbt?.homeworkAdherence?.total || 0}</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${cbt?.homeworkAdherence?.percent || 0}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Adherencia: <span className="font-semibold">{cbt?.homeworkAdherence?.percent || 0}%</span></p>
            </div>
          </div>
        </div>

        {/* Hourly Distribution / Modality Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Modalidad de Sesiones (30 días)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-800">Presencial</p>
              <p className="text-2xl font-bold text-blue-900">{cbt?.modality?.['in-person'] || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-800">Online</p>
              <p className="text-2xl font-bold text-purple-900">{cbt?.modality?.online || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-800">Teléfono</p>
              <p className="text-2xl font-bold text-green-900">{cbt?.modality?.phone || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CBT Row 3: Sessions by week and Techniques used */}
      {cbt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions by week */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h2a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm7 0a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zm7 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Sesiones por Semana (8 semanas)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={(cbt.sessionsByWeek || []).map((v, i) => ({ name: `W${i + 1}`, count: v }))}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorSessions)" name="Sesiones" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Techniques used */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Técnicas TCC en Planes Activos
            </h3>
            <div className="space-y-3">
              {(cbt.interventions || []).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-700">{t.technique}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${Math.min(100, t.count * 10)}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{t.count}</span>
                  </div>
                </div>
              ))}
              {(!cbt.interventions || cbt.interventions.length === 0) && (
                <p className="text-gray-500">No hay técnicas registradas aún.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Próximas Citas
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay citas programadas</p>
            ) : (
              upcomingAppointments.map((apt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
                      {apt.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{apt.user?.name || 'Paciente'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.appointmentDate).toLocaleDateString('es-ES', { 
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
            ) : (
              recentPatients.map((patient, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(patient.lastVisit).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                    patient.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all flex flex-col items-center gap-2 hover:bg-blue-50">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Nueva Cita</span>
          </button>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all flex flex-col items-center gap-2 hover:bg-green-50">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Nuevo Paciente</span>
          </button>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all flex flex-col items-center gap-2 hover:bg-purple-50">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Nota Clínica</span>
          </button>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all flex flex-col items-center gap-2 hover:bg-orange-50">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Insights Inteligentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-blue-600 font-semibold mb-2">📈 Tendencia Positiva</p>
            <p className="text-sm text-gray-700">Tus citas completadas aumentaron 24% este mes. ¡Excelente trabajo!</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-orange-600 font-semibold mb-2">⚠️ Recomendación</p>
            <p className="text-sm text-gray-700">Considera abrir más slots de 2-4pm, es tu horario más demandado.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-green-600 font-semibold mb-2">⭐ Destacado</p>
            <p className="text-sm text-gray-700">Tu calificación promedio es {stats.averageRating.toFixed(1)}/5. Sobresaliente!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInsightsElite;
