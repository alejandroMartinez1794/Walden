import { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loader/Loading';
import ErrorMessage from '../../components/Error/Error';
import DoctorProfileForm from '../doctor-account/Profile';
import { authContext } from '../../context/AuthContext';

// Panels
import OverviewPanel from './panels/OverviewPanel';
import AgendaPanel from './panels/AgendaPanel';
import TelemedicinePanel from './panels/TelemedicinePanel';

const PsychologyDashboard = () => {
  const { token } = useContext(authContext);
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [cbtOverview, setCbtOverview] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePanel, setActivePanel] = useState('resumen');

  // Data Fetching
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, overviewRes, doctorRes] = await Promise.all([
        fetch(`${BASE_URL}/psychology/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/psychology/dashboard/cbt-overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/doctors/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const dashboardJson = await dashboardRes.json();
      const overviewJson = await overviewRes.json();
      const doctorJson = await doctorRes.json();

      if (dashboardRes.status === 401) {
        throw new Error('Sesión expirada');
      }

      if (!dashboardRes.ok) throw new Error(dashboardJson.message);
      
      setDashboardData(dashboardJson.data);
      setCbtOverview(overviewJson.data);
      setDoctorProfile(doctorJson.data);
    } catch (err) {
      setError(err.message);
      if (err.message === 'Sesión expirada') {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  // Configuration
  const quickActions = [
    {
      title: 'Historias clínicas',
      description: 'Documenta evolución y hallazgos',
      to: '/psychology/clinical-history',
      gradient: 'from-sky-500 to-indigo-600',
      icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      title: 'Nuevo paciente',
      description: 'Registra intake e historia inicial',
      to: '/psychology/patients/new',
      gradient: 'from-cyan-500 to-blue-600',
      icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      title: 'Lista de pacientes',
      description: 'Visualiza planes activos',
      to: '/psychology/patients',
      gradient: 'from-emerald-500 to-teal-600',
      icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      title: 'Crear sesión',
      description: 'Programa la próxima intervención',
      to: '/psychology/sessions/new',
      gradient: 'from-purple-500 to-fuchsia-600',
      icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      title: 'Nueva evaluación',
      description: 'Aplica escalas clínicas',
      to: '/psychology/assessments/new',
      gradient: 'from-amber-500 to-orange-600',
      icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    },
  ];

  const assessmentShortcuts = [
    { title: 'PHQ-9', subtitle: 'Depresión', to: '/psychology/assessments/phq9' },
    { title: 'BDI-II', subtitle: 'Depresión', to: '/psychology/assessments/bdi-ii' },
    { title: 'GAD-7', subtitle: 'Ansiedad', to: '/psychology/assessments/gad7' },
    { title: 'BAI', subtitle: 'Ansiedad', to: '/psychology/assessments/bai' },
    { title: 'PCL-5', subtitle: 'Trauma', to: '/psychology/assessments/pcl5' },
    { title: 'OCI-R', subtitle: 'TOC', to: '/psychology/assessments/ocir' },
  ];

  const panelTabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'telepsicologia', label: 'Telepsicología' },
    { id: 'perfil', label: 'Perfil' },
  ];

  if (loading && !dashboardData) return <Loading />;
  if (error && !dashboardData) return <ErrorMessage message={error} />;

  return (
    <section className="bg-[#f8fafc] min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tabs de Navegación */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-fit">
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activePanel === tab.id
                  ? 'bg-[#09152c] text-white shadow-md transform scale-105'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido del Panel */}
        <div className="min-h-[600px]">
          {activePanel === 'resumen' && (
            <OverviewPanel 
              dashboardData={dashboardData}
              cbtOverview={cbtOverview}
              doctorProfile={doctorProfile}
              quickActions={quickActions}
              assessmentShortcuts={assessmentShortcuts}
            />
          )}

          {activePanel === 'agenda' && (
            <AgendaPanel 
              appointments={doctorProfile?.appointments || []}
              doctorProfile={doctorProfile}
              token={token}
              onRefresh={fetchDashboardData}
            />
          )}

          {activePanel === 'telepsicologia' && (
            <TelemedicinePanel />
          )}

          {activePanel === 'perfil' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-fade-in-up">
              <DoctorProfileForm user={doctorProfile} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PsychologyDashboard;
