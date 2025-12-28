// Frontend/src/Dashboard/psychology/PsychologyDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { BASE_URL } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';
import DoctorAbout from '../../pages/Doctors/DoctorAbout';
import DoctorProfileForm from '../doctor-account/Profile';
import { authContext } from '../../context/AuthContext';

const PsychologyDashboard = () => {
  const { token } = useContext(authContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [cbtOverview, setCbtOverview] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [activePanel, setActivePanel] = useState('resumen');
  const [appointmentsFilter, setAppointmentsFilter] = useState('all');
  const [appointmentsSearch, setAppointmentsSearch] = useState('');
  const [appointmentAction, setAppointmentAction] = useState(null);
  const [bookingForm, setBookingForm] = useState({ patientEmail: '', patientId: '', patientName: '', date: '', time: '', motivo: '' });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookingMotivoTemplates = [
    'Sesión de seguimiento',
    'Revisión de tareas y plan semanal',
    'Activación conductual',
    'Reestructuración cognitiva',
    'Exposición (planificación)',
    'Prevención de recaídas',
  ];

  const panelTabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'analitica', label: 'Analítica' },
    { id: 'citas', label: 'Citas' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'atajos', label: 'Atajos' },
  ];

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const authToken = token;
        const [dashboardRes, overviewRes, doctorRes] = await Promise.all([
          fetch(`${BASE_URL}/psychology/dashboard`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          fetch(`${BASE_URL}/psychology/dashboard/cbt-overview`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          fetch(`${BASE_URL}/doctors/profile/me`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        const dashboardJson = await dashboardRes.json();
        const overviewJson = await overviewRes.json();
        const doctorJson = await doctorRes.json();

        if (dashboardRes.status === 401 || overviewRes.status === 401 || doctorRes.status === 401) {
          setError(dashboardJson.message || overviewJson.message || doctorJson.message || 'Sesión expirada');
          setTimeout(() => navigate('/login'), 1000);
          return;
        }
        if (!dashboardRes.ok) throw new Error(dashboardJson.message || 'No se pudo cargar el dashboard');
        if (!overviewRes.ok) throw new Error(overviewJson.message || 'No se pudo cargar las métricas TCC');
        if (!doctorRes.ok) throw new Error(doctorJson.message || 'No se pudo obtener el perfil del terapeuta');

        setDashboardData(dashboardJson.data);
        setCbtOverview(overviewJson.data);
        setDoctorProfile(doctorJson.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, token]);

  const refetchDoctorProfile = async () => {
    try {
      if (!token) return;
      const doctorRes = await fetch(`${BASE_URL}/doctors/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorJson = await doctorRes.json();
      if (doctorRes.ok) {
        setDoctorProfile(doctorJson.data);
      }
    } catch (err) {
      console.error('Error recargando perfil de doctor:', err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const { totalPatients, activePatients, todaySessions, riskAlerts } = dashboardData || {};
  const sessionsCount = todaySessions?.length || 0;
  const highlightedSession = todaySessions?.[0];

  const severityTrends = cbtOverview?.severityTrends;
  const monthLabels = severityTrends?.labels || [];

  const findLastValues = (series = []) => {
    let last = null;
    let prev = null;
    for (let i = series.length - 1; i >= 0; i--) {
      const value = series[i];
      if (value === null || value === undefined) continue;
      if (last === null) {
        last = value;
      } else {
        prev = value;
        break;
      }
    }
    return { last, prev };
  };

  const severitySeries = [
    { name: 'PHQ-9', key: 'phq9', max: 27, gradient: 'from-cyan-500 to-blue-500' },
    { name: 'BDI-II', key: 'bdi2', max: 63, gradient: 'from-sky-500 to-indigo-600' },
    { name: 'GAD-7', key: 'gad7', max: 21, gradient: 'from-teal-500 to-emerald-500' },
  ].map((conf) => {
    const data = severityTrends?.[conf.key] || [];
    const { last, prev } = findLastValues(data);
    const delta = last !== null && prev !== null ? Number((last - prev).toFixed(1)) : null;
    return { ...conf, data, last, prev, delta };
  });

  const weeklySessions = cbtOverview?.sessionsByWeek || [];
  const modality = cbtOverview?.modality || {};
  const totalModalities = Object.values(modality).reduce((sum, value) => sum + (value || 0), 0);
  const distortions = cbtOverview?.distortions || [];
  const totalDistortions = distortions.reduce((sum, d) => sum + (d.value || 0), 0);
  const homework = cbtOverview?.homeworkAdherence || { completed: 0, total: 0, percent: 0 };
  const interventions = (cbtOverview?.interventions || []).slice(0, 6);
  const analyticRiskCount = cbtOverview?.riskAlerts?.count ?? riskAlerts?.length ?? 0;

  const getMeasureBand = (measure, score) => {
    if (score === null || score === undefined) return { label: 'Sin dato', tone: 'bg-slate-100 text-slate-600 border-slate-200' };

    if (measure === 'PHQ-9') {
      if (score <= 4) return { label: 'Mínima', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      if (score <= 9) return { label: 'Leve', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
      if (score <= 14) return { label: 'Moderada', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
      if (score <= 19) return { label: 'Mod. severa', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
      return { label: 'Severa', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
    }

    if (measure === 'GAD-7') {
      if (score <= 4) return { label: 'Mínima', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      if (score <= 9) return { label: 'Leve', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
      if (score <= 14) return { label: 'Moderada', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
      return { label: 'Severa', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
    }

    if (measure === 'BDI-II') {
      if (score <= 13) return { label: 'Mínima', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      if (score <= 19) return { label: 'Leve', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
      if (score <= 28) return { label: 'Moderada', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
      return { label: 'Severa', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
    }

    return { label: '—', tone: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const statCards = [
    {
      label: 'Total de pacientes',
      value: totalPatients || 0,
      detail: 'Registro activo en tu cartera',
      gradient: 'from-[#0c1224] via-[#141f3c] to-[#1c2f58]',
      icon: (
        <svg className="h-10 w-10 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Pacientes activos',
      value: activePatients || 0,
      detail: 'En tratamiento semanal',
      gradient: 'from-[#0f1b2f] via-[#142745] to-[#1f3b67]',
      icon: (
        <svg className="h-10 w-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Sesiones del día',
      value: sessionsCount,
      detail: 'Agenda confirmada hoy',
      gradient: 'from-[#131e33] via-[#1c2b4a] to-[#28406d]',
      icon: (
        <svg className="h-10 w-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Alertas activas',
      value: analyticRiskCount,
      detail: 'Casos con banderas clínicas',
      gradient: 'from-[#24121c] via-[#3a1d2f] to-[#4e243c]',
      icon: (
        <svg className="h-10 w-10 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  const doctorDisplayName = doctorProfile?.name || 'Profesional TCC';
  const doctorAvatar = doctorProfile?.photo || (doctorProfile?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorProfile.name)}&background=09152c&color=fff&size=512`
    : null);

  const quickActions = [
    {
      title: 'Historias clínicas',
      description: 'Documenta evolución y hallazgos',
      to: '/psychology/clinical-history',
      gradient: 'from-sky-500 to-indigo-600',
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Nuevo paciente',
      description: 'Registra intake e historia inicial',
      to: '/psychology/patients/new',
      gradient: 'from-cyan-500 to-blue-600',
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: 'Lista de pacientes',
      description: 'Visualiza planes activos',
      to: '/psychology/patients',
      gradient: 'from-emerald-500 to-teal-600',
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Crear sesión',
      description: 'Programa la próxima intervención',
      to: '/psychology/sessions/new',
      gradient: 'from-purple-500 to-fuchsia-600',
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: 'Nueva evaluación',
      description: 'Aplica escalas clínicas',
      to: '/psychology/assessments/new',
      gradient: 'from-amber-500 to-orange-600',
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
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

  const doctorAppointments = doctorProfile?.appointments || [];
  const appointmentStats = {
    total: doctorAppointments.length,
    upcoming: doctorAppointments.filter((apt) => apt.status === 'approved').length,
    completed: doctorAppointments.filter((apt) => apt.status === 'completed').length,
    cancelled: doctorAppointments.filter((apt) => apt.status === 'cancelled').length,
  };

  const normalizeSearch = appointmentsSearch.trim().toLowerCase();
  const filteredAppointments = doctorAppointments
    .filter((apt) => {
      if (appointmentsFilter === 'upcoming' && apt.status !== 'approved') return false;
      if (appointmentsFilter === 'completed' && apt.status !== 'completed') return false;
      if (appointmentsFilter === 'cancelled' && apt.status !== 'cancelled') return false;
      if (normalizeSearch) {
        const candidate = `${apt.user?.name || ''} ${apt.user?.email || ''}`.toLowerCase();
        return candidate.includes(normalizeSearch);
      }
      return true;
    })
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const appointmentStatusStyles = {
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const appointmentStatusLabel = {
    approved: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    pending: 'Pendiente',
  };

  const handleAppointmentStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setAppointmentAction(`${appointmentId}-${newStatus}`);
      if (!token) throw new Error('Sesión no disponible');
      const response = await fetch(`${BASE_URL}/bookings/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'No se pudo actualizar la cita');
      }
      toast.success(result.message || 'Estado actualizado');
      setDoctorProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          appointments: prev.appointments?.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt
          ),
        };
      });
    } catch (err) {
      toast.error(err.message || 'Error al actualizar la cita');
    } finally {
      setAppointmentAction(null);
    }
  };

  const handleBookingInput = (e) => {
    const { name, value } = e.target;
    const preserveValue = name === 'date' || name === 'time';
    const sanitizedValue = typeof value === 'string' && !preserveValue ? value.trim() : value;
    const normalizedValue = preserveValue && value === ' ' ? '' : sanitizedValue;
    setBookingForm((prev) => ({ ...prev, [name]: normalizedValue }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (bookingSubmitting) return;
    const missingPatientReference = !bookingForm.patientEmail && !bookingForm.patientId;
    if (!bookingForm.date || !bookingForm.time || missingPatientReference) {
      toast.info('Completa paciente, fecha y hora.');
      return;
    }
    if (bookingForm.patientEmail && !bookingForm.patientId && !bookingForm.patientName) {
      toast.info('Escribe el nombre del paciente para registrarlo automáticamente.');
      return;
    }
    try {
      setBookingSubmitting(true);
      if (!token) throw new Error('Sesión no disponible');
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientEmail: bookingForm.patientEmail || undefined,
          patientId: bookingForm.patientId || undefined,
          patientName: bookingForm.patientName || undefined,
          date: bookingForm.date,
          time: bookingForm.time,
          motivoConsulta: bookingForm.motivo,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'No se pudo agendar la cita');
      }
      toast.success(result.message || 'Cita creada');
      setBookingForm({ patientEmail: '', patientId: '', patientName: '', date: '', time: '', motivo: '' });
      await refetchDoctorProfile();
    } catch (err) {
      toast.error(err.message || 'Error al crear la cita');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#050912] via-[#0a1425] to-[#111f3e] py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(59,130,246,0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.2), transparent 30%), radial-gradient(circle at 50% 80%, rgba(16,185,129,0.15), transparent 40%)',
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-6 lg:px-10">
        <div
          className="relative overflow-hidden rounded-[36px] border border-white/15 p-10 text-white shadow-[0_40px_120px_rgba(4,7,21,0.65)]"
          style={{ background: 'linear-gradient(125deg, #0a172c, #13254a 55%, #1f3c6f)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 15%, rgba(59,130,246,0.45), transparent 50%), radial-gradient(circle at 85% 0%, rgba(14,165,233,0.4), transparent 35%)',
            }}
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Práctica psicológica</p>
              <h1 className="text-4xl font-semibold leading-tight">
                Hola, {dashboardData?.psychologistName || 'profesional'}. Gestiona tu jornada terapéutica con claridad clínica.
              </h1>
              <p className="max-w-2xl text-base text-white/80">
                Visualiza tu agenda del día, identifica alertas críticas y accede a las herramientas que sostienen tu intervención cognitivo
                conductual.
              </p>
              {doctorProfile && (
                <div className="flex items-center gap-4 rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="h-20 w-20 overflow-hidden rounded-[32px] border border-white/30 bg-slate-900/60 p-1">
                    {doctorAvatar ? (
                      <img
                        src={doctorAvatar}
                        alt={`Foto de ${doctorDisplayName}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white">
                        {doctorDisplayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Terapeuta CBT</p>
                    <p className="text-xl font-semibold text-white">{doctorDisplayName}</p>
                    <p className="text-sm text-white/70">{doctorProfile.specialization || 'Especialidad pendiente'}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/psychology/sessions/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-lg backdrop-blur hover:bg-white/25"
                >
                  Programar sesión
                  <span aria-hidden className="text-lg">→</span>
                </Link>
                <Link
                  to="/psychology/patients/new"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold tracking-wide text-white/80 hover:text-white"
                >
                  Registrar intake
                </Link>
              </div>
            </div>
            <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">Próxima sesión</p>
              {highlightedSession ? (
                <div className="mt-4 space-y-3">
                  <p className="text-2xl font-semibold">{highlightedSession.patient?.personalInfo?.fullName}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-white/80">
                    <span className="rounded-2xl border border-white/30 px-3 py-1">
                      {new Date(highlightedSession.sessionDate).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="rounded-2xl border border-white/30 px-3 py-1">Sesión #{highlightedSession.sessionNumber}</span>
                    <span className="rounded-2xl border border-white/30 px-3 py-1 capitalize">{highlightedSession.modality}</span>
                  </div>
                  <p className="text-sm text-white/70">
                    Enfoque sugerido: {highlightedSession.focus || 'Revisar progreso y ajustar tareas'}
                  </p>
                  {highlightedSession.patient?._id && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/psychology/patients/${highlightedSession.patient._id}`}
                        className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
                      >
                        Abrir expediente
                      </Link>
                      <Link
                        to={`/psychology/patients/${highlightedSession.patient._id}/session`}
                        className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 hover:text-white"
                      >
                        Iniciar nota de sesión
                      </Link>
                      <Link
                        to={`/psychology/patients/${highlightedSession.patient._id}/clinical-history`}
                        className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 hover:text-white"
                      >
                        Historia clínica
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-lg text-white/70">Aún no tienes sesiones programadas para hoy.</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 rounded-[28px] border border-white/10 bg-white/10 p-2 backdrop-blur">
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePanel(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold tracking-wide transition ${
                activePanel === tab.id ? 'bg-white/20 text-white shadow' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span>{tab.label}</span>
                {tab.id === 'agenda' && (
                  <span className="rounded-2xl bg-white/15 px-2 py-0.5 text-xs font-semibold text-white/90">
                    {sessionsCount}
                  </span>
                )}
                {tab.id === 'citas' && (
                  <span className="rounded-2xl bg-white/15 px-2 py-0.5 text-xs font-semibold text-white/90">
                    {appointmentStats.total}
                  </span>
                )}
                {tab.id === 'analitica' && (
                  <span className="rounded-2xl bg-white/15 px-2 py-0.5 text-xs font-semibold text-white/90">
                    {analyticRiskCount}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>

        {activePanel === 'resumen' && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${card.gradient} p-6 text-white shadow-[0_30px_80px_rgba(5,8,20,0.45)]`}
                >
                  <div className="absolute right-4 top-4 rounded-2xl border border-white/20 bg-white/10 p-3">{card.icon}</div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">{card.label}</p>
                  <p className="mt-4 text-4xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm text-white/70">{card.detail}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
                <header className="mb-4">
                  <p className="text-sm font-semibold text-slate-500">Flujo TCC</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Checklist para la sesión</h2>
                  <p className="text-sm text-slate-500">Estructura breve para sostener foco, evidencia y seguimiento.</p>
                </header>
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">1</span>
                    <div>
                      <p className="font-semibold text-slate-900">Agenda y puente</p>
                      <p className="text-slate-500">Problema actual, objetivo de hoy y enlace con semana anterior.</p>
                    </div>
                  </li>
                  <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">2</span>
                    <div>
                      <p className="font-semibold text-slate-900">Revisión de tareas</p>
                      <p className="text-slate-500">Qué funcionó, barreras, ajuste de dificultad y refuerzo.</p>
                    </div>
                  </li>
                  <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">3</span>
                    <div>
                      <p className="font-semibold text-slate-900">Intervención</p>
                      <p className="text-slate-500">Pensamientos automáticos, exposición, activación o habilidades.</p>
                    </div>
                  </li>
                  <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">4</span>
                    <div>
                      <p className="font-semibold text-slate-900">Plan semanal</p>
                      <p className="text-slate-500">Tarea concreta, frecuencia, disparadores y plan de riesgo si aplica.</p>
                    </div>
                  </li>
                </ol>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
                <header className="mb-4">
                  <p className="text-sm font-semibold text-slate-500">Señales rápidas</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Lo que conviene mirar</h2>
                  <p className="text-sm text-slate-500">Adherencia, patrones cognitivos y técnica dominante.</p>
                </header>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Adherencia a tareas</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-2xl font-semibold text-slate-900">{homework.percent || 0}%</p>
                      <span className="text-sm text-slate-500">{homework.completed} / {homework.total}</span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${homework.percent || 0}%` }} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Distorsión más frecuente</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{distortions?.[0]?.name || 'Sin registros'}</p>
                    <p className="text-sm text-slate-500">Útil para psicoeducación y experimentos.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Técnica dominante</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {interventions?.[0]?.technique ? interventions[0].technique.replace(/-/g, ' ') : 'Sin registros'}
                    </p>
                    <p className="text-sm text-slate-500">Balancea intervención cognitiva vs conductual.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
                <header className="mb-4">
                  <p className="text-sm font-semibold text-slate-500">Acciones clínicas</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Siguiente paso</h2>
                  <p className="text-sm text-slate-500">Entradas directas a lo que más mueve el tratamiento.</p>
                </header>
                <div className="grid gap-3">
                  <Link to="/psychology/assessments/new" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                    Aplicar evaluación (PHQ-9 / BDI-II / GAD-7)
                  </Link>
                  <Link to="/psychology/clinical-history" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Documentar evolución clínica
                  </Link>
                  <Link to="/psychology/patients" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Revisar cartera de pacientes
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActivePanel('agenda')}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver agenda de hoy
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activePanel === 'agenda' && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Sesiones del día</p>
                <h2 className="text-2xl font-semibold text-slate-900">Agenda terapéutica</h2>
              </div>
              <span className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {sessionsCount} {sessionsCount === 1 ? 'sesión' : 'sesiones'}
              </span>
            </header>
            {sessionsCount > 0 ? (
              <div className="space-y-4">
                {todaySessions.map((session) => {
                  const time = new Date(session.sessionDate).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const modalityCopy =
                    session.modality === 'online'
                      ? 'Online'
                      : session.modality === 'phone'
                        ? 'Teléfono'
                        : 'Presencial';
                  const modalityColors =
                    session.modality === 'online'
                      ? 'bg-blue-100 text-blue-800'
                      : session.modality === 'phone'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800';
                  return (
                    <article key={session._id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{session.patient?.personalInfo?.fullName}</p>
                        <p className="text-sm text-slate-500">Sesión #{session.sessionNumber} · Objetivo: {session.focus || 'Revisar tareas y actualizar plan'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-2xl bg-slate-900 px-3 py-1 text-sm font-medium text-white">{time}</span>
                        <span className={`rounded-2xl px-3 py-1 text-xs font-semibold ${modalityColors}`}>{modalityCopy}</span>
                        {session.patient?._id && (
                          <Link
                            to={`/psychology/patients/${session.patient._id}`}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Expediente
                          </Link>
                        )}
                        {session.patient?._id && (
                          <Link
                            to={`/psychology/patients/${session.patient._id}/session`}
                            className="rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Nota
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                No hay sesiones programadas para hoy.
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
            <header className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Alertas clínicas</p>
                <h2 className="text-2xl font-semibold text-slate-900">Riesgos activos</h2>
              </div>
            </header>
            {riskAlerts && riskAlerts.length > 0 ? (
              <ul className="space-y-4">
                {riskAlerts.map((alert) => (
                  <li key={alert._id} className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-red-700">{alert.patient?.personalInfo?.fullName}</p>
                        <p className="text-sm text-red-600">{alert.riskAlert?.reason || 'Alerta registrada'}</p>
                        {alert.riskAlert?.type && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-500">{String(alert.riskAlert.type).replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      {alert.patient?._id && (
                        <Link
                          to={`/psychology/patients/${alert.patient._id}`}
                          className="rounded-2xl border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Abrir expediente
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-400">
                Sin alertas críticas por ahora. Mantén el seguimiento continuo.
              </p>
            )}
          </section>
          </div>
        )}

        {activePanel === 'analitica' && (
          <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
            <section className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
            <header className="mb-6">
              <p className="text-sm font-semibold text-slate-500">Panel analítico TCC</p>
              <h2 className="text-2xl font-semibold text-slate-900">Tendencias de severidad y ritmo clínico</h2>
              <p className="text-sm text-slate-500">Lectura rápida de severidad promedio, adherencia semanal y modalidad para ajustar intervenciones.</p>
            </header>

            <div className="mb-8 grid gap-4 lg:grid-cols-3">
              {severitySeries.map((series) => {
                const band = getMeasureBand(series.name, series.last);
                return (
                  <article key={`band-${series.name}`} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{series.name}</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">{series.last !== null ? series.last : '—'}</p>
                        <p className="text-sm text-slate-500">Promedio actual</p>
                      </div>
                      <span className={`h-fit rounded-2xl border px-3 py-1 text-xs font-semibold ${band.tone}`}>{band.label}</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-600">
                      {series.delta !== null ? (
                        <span>
                          Cambio: <span className="font-semibold text-slate-900">{series.delta > 0 ? '+' : ''}{series.delta}</span> vs periodo anterior
                        </span>
                      ) : (
                        <span>Sin comparación disponible</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {severitySeries.map((series) => {
                const progress = series.last !== null ? Math.min(100, Math.max(0, Math.round((series.last / series.max) * 100))) : 0;
                const timelineLength = monthLabels.length || series.data.length || 6;
                const timeline = Array.from({ length: timelineLength }, (_, idx) => ({
                  label: monthLabels[idx] || `M${idx + 1}`,
                  value: series.data[idx] ?? null,
                }));
                return (
                  <article
                    key={series.name}
                    className={`relative overflow-hidden rounded-[28px] border border-slate-100 bg-gradient-to-br ${series.gradient} p-5 text-white`}
                  >
                    <p className="text-xs uppercase tracking-[0.35em] text-white/80">{series.name}</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-4xl font-semibold">{series.last !== null ? series.last : '—'}</p>
                        <p className="text-sm text-white/80">Promedio actual</p>
                      </div>
                      {series.delta !== null && (
                        <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${series.delta >= 0 ? 'bg-white/20 text-rose-100' : 'bg-white/20 text-emerald-100'}`}>
                          {series.delta > 0 ? '+' : ''}
                          {series.delta}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/30">
                      <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-4 flex items-end gap-1 h-24">
                      {timeline.map((item) => {
                        const height = item.value !== null ? Math.max(6, Math.min(100, (item.value / series.max) * 100)) : 4;
                        return <span key={`${series.name}-${item.label}`} className="flex-1 rounded-full bg-white/40" style={{ height: `${height}%` }} title={`${item.label}: ${item.value ?? 'sin dato'}`} />;
                      })}
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">Últimos {timelineLength} meses</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <article className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Cadencia semanal</p>
                    <h3 className="text-xl font-semibold text-slate-900">Sesiones por semana</h3>
                  </div>
                  <span className="text-sm text-slate-500">Últimas 8 semanas</span>
                </div>
                {weeklySessions.length > 0 ? (
                  <div className="mt-4 flex h-32 items-end gap-2">
                    {weeklySessions.map((count, idx) => {
                      const weekHeight = weeklySessions.length ? Math.min(100, ((count || 0) / Math.max(...weeklySessions, 1)) * 100) : 0;
                      return (
                        <div key={`week-${idx}`} className="flex-1 rounded-full bg-slate-200">
                          <span
                            className="block w-full rounded-full bg-slate-900"
                            style={{ height: `${weekHeight || 4}%` }}
                            title={`Semana ${idx + 1}: ${count || 0} sesiones`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">Aún no hay registros suficientes.</p>
                )}
              </article>
              <article className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Modalidad</p>
                  <h3 className="text-xl font-semibold text-slate-900">Distribución de sesiones</h3>
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    { key: 'in-person', label: 'Presencial' },
                    { key: 'online', label: 'Online' },
                    { key: 'phone', label: 'Teléfono' },
                  ].map((item) => {
                    const count = modality[item.key] || 0;
                    const percent = totalModalities ? Math.round((count / totalModalities) * 100) : 0;
                    return (
                      <div key={item.key}>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>{item.label}</span>
                          <span>{count} · {percent}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-slate-900" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
            <header className="mb-6">
              <p className="text-sm font-semibold text-slate-500">Radar clínico</p>
              <h2 className="text-2xl font-semibold text-slate-900">Distorsiones, tareas e intervenciones</h2>
              <p className="text-sm text-slate-500">Detecta patrones cognitivos y seguimiento conductual sin salir del panel.</p>
            </header>
            <div className="space-y-6">
              <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">Top distorsiones cognitivas</p>
                <div className="mt-4 space-y-3">
                  {distortions.length > 0 ? (
                    distortions.map((distortion) => {
                      const percent = totalDistortions ? Math.round((distortion.value / totalDistortions) * 100) : 0;
                      return (
                        <div key={distortion.name}>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{distortion.name}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-white">
                            <div className="h-full rounded-full bg-slate-900" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">Sin registros recientes de distorsiones.</p>
                  )}
                </div>
              </article>

              <article className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-5 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500">Adherencia conductual</p>
                  <h3 className="text-xl font-semibold text-slate-900">Tareas completadas</h3>
                  <p className="text-sm text-slate-500">{homework.completed} de {homework.total} asignaciones registradas.</p>
                </div>
                <div className="relative h-32 w-32">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: `conic-gradient(#0ea5e9 ${homework.percent || 0}%, rgba(15,23,42,0.1) 0)` }}
                  />
                  <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-semibold text-slate-900">{homework.percent || 0}%</span>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Intervenciones dominantes</p>
                    <h3 className="text-xl font-semibold text-slate-900">Técnicas activas</h3>
                  </div>
                  <Link to="/psychology/patients" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
                    Ver pacientes
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {interventions.length > 0 ? (
                    interventions.map((technique) => (
                      <span key={technique.technique} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow">
                        {technique.technique.replace(/-/g, ' ')} ({technique.count})
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Aún no hay técnicas activas registradas.</p>
                  )}
                </div>
              </article>
            </div>
          </section>
          </div>
        )}

        {activePanel === 'perfil' && doctorProfile && (
          <section className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
              <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Identidad profesional</p>
                  <h2 className="text-3xl font-semibold text-slate-900">Resumen del terapeuta</h2>
                  <p className="text-sm text-slate-500">Presentación clínica breve: enfoque, credenciales y claridad para el paciente.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                    {doctorProfile.specialization || 'Especialidad sin definir'}
                  </span>
                  <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                    {doctorProfile.gender === 'female'
                      ? 'Doctora'
                      : doctorProfile.gender === 'male'
                        ? 'Doctor'
                        : 'Profesional de la salud'}
                  </span>
                </div>
              </header>
              <div className="grid gap-8 xl:grid-cols-[0.45fr,0.55fr]">
                <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 h-28 w-28 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900/5 p-1 shadow-lg">
                      {doctorProfile.photo ? (
                        <img
                          src={doctorProfile.photo}
                          alt={`Foto de ${doctorProfile.name}`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-2xl font-semibold text-white">
                          {doctorProfile.name?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">{doctorProfile.name}</h3>
                    <p className="text-sm text-slate-500">{doctorProfile.email}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1 shadow">
                        ⭐ {doctorProfile.averageRating || '0'} ({doctorProfile.totalRating || 0})
                      </span>
                      {doctorProfile.ticketPrice && (
                        <span className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1 shadow">
                          Honorarios ${doctorProfile.ticketPrice}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-slate-600">{doctorProfile.bio || 'Comparte tu enfoque terapéutico y experiencia clínica para generar confianza con tus pacientes.'}</p>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-100 bg-white p-6">
                  <DoctorAbout
                    name={doctorProfile.name}
                    about={doctorProfile.about || 'Describe tu marco cognitivo conductual, protocolos preferidos y resultados clínicos destacados.'}
                    qualifications={doctorProfile.qualifications || []}
                    experiences={doctorProfile.experiences || []}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
              <header className="mb-6">
                <p className="text-sm font-semibold text-slate-500">Configuración del terapeuta</p>
                <h2 className="text-3xl font-semibold text-slate-900">Actualiza tu perfil clínico</h2>
                <p className="text-sm text-slate-500">Ajusta datos (bio, experiencia y disponibilidad) sin salir del dashboard.</p>
              </header>
              <DoctorProfileForm doctorData={doctorProfile} />
            </section>
          </section>
        )}

        {activePanel === 'citas' && (
          <section className="rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
          <header className="mb-6 flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-500">Agendar cita directa</p>
            <h2 className="text-2xl font-semibold text-slate-900">Programa una nueva cita</h2>
            <p className="text-sm text-slate-500">Agenda una sesión y deja el motivo en términos clínicos (objetivo / tarea / seguimiento).</p>
          </header>
          <form onSubmit={handleCreateBooking} className="grid gap-4 lg:grid-cols-5">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 lg:col-span-2">
              Paciente (email o ID)
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="email"
                  name="patientEmail"
                  value={bookingForm.patientEmail}
                  onChange={handleBookingInput}
                  placeholder="paciente@correo.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
                />
                <input
                  type="text"
                  name="patientId"
                  value={bookingForm.patientId}
                  onChange={handleBookingInput}
                  placeholder="ID (opcional)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
                />
              </div>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 lg:col-span-2">
              Nombre del paciente
              <input
                type="text"
                name="patientName"
                value={bookingForm.patientName}
                onChange={handleBookingInput}
                placeholder="Nombre completo"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <span className="text-xs font-normal text-slate-400">Completa este campo si el paciente aún no está registrado.</span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              Fecha
              <input
                type="date"
                name="date"
                value={bookingForm.date}
                onChange={handleBookingInput}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              Hora
              <input
                type="time"
                name="time"
                value={bookingForm.time}
                onChange={handleBookingInput}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 lg:col-span-2">
              Motivo (opcional)
              <input
                type="text"
                name="motivo"
                value={bookingForm.motivo}
                onChange={handleBookingInput}
                placeholder="Ej. Sesión de seguimiento"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {bookingMotivoTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setBookingForm((prev) => ({ ...prev, motivo: template }))}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingSubmitting ? 'Agendando...' : 'Agendar cita'}
              </button>
            </div>
          </form>
          </section>
        )}

        {activePanel === 'citas' && (
          <section className="rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Agenda integral</p>
              <h2 className="text-3xl font-semibold text-slate-900">Gestión de citas</h2>
              <p className="text-sm text-slate-500">El módulo de Appointments vive aquí, conectado al resto de tus métricas.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">Total {appointmentStats.total}</span>
              <span className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2">Confirmadas {appointmentStats.upcoming}</span>
              <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">Completadas {appointmentStats.completed}</span>
              <span className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2">Canceladas {appointmentStats.cancelled}</span>
            </div>
          </header>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Todas', icon: '📋' },
                { id: 'upcoming', label: 'Próximas', icon: '⏰' },
                { id: 'completed', label: 'Completadas', icon: '✅' },
                { id: 'cancelled', label: 'Canceladas', icon: '❌' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setAppointmentsFilter(filter.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    appointmentsFilter === filter.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                value={appointmentsSearch}
                onChange={(e) => setAppointmentsSearch(e.target.value)}
                placeholder="Buscar paciente..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 pl-10 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredAppointments.length === 0 && (
              <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                No hay citas en esta categoría.
              </p>
            )}
            {filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.appointmentDate);
              const dateLabel = appointmentDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeLabel = appointmentDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <article key={appointment._id} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-lg font-semibold text-white">
                      {appointment.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{appointment.user?.name || 'Paciente'}</h3>
                        <span className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${appointmentStatusStyles[appointment.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {appointmentStatusLabel[appointment.status] || appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{appointment.user?.email || 'Sin correo registrado'}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span className="rounded-2xl bg-slate-100 px-3 py-1">{dateLabel}</span>
                        <span className="rounded-2xl bg-slate-100 px-3 py-1">{timeLabel}</span>
                        {appointment.ticketPrice && <span className="rounded-2xl bg-emerald-50 px-3 py-1 text-emerald-700">${appointment.ticketPrice}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAppointmentStatusUpdate(appointment._id, 'approved')}
                          disabled={appointmentAction === `${appointment._id}-approved`}
                          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleAppointmentStatusUpdate(appointment._id, 'cancelled')}
                          disabled={appointmentAction === `${appointment._id}-cancelled`}
                          className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {appointment.status === 'approved' && (
                      <button
                        onClick={() => handleAppointmentStatusUpdate(appointment._id, 'completed')}
                        disabled={appointmentAction === `${appointment._id}-completed`}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Marcar completada
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          </section>
        )}

        {activePanel === 'atajos' && (
          <section className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(9,12,28,0.1)]">
              <header className="mb-6">
                <p className="text-sm font-semibold text-slate-500">Módulo TCC</p>
                <h2 className="text-2xl font-semibold text-slate-900">Herramientas clínicas</h2>
                <p className="text-sm text-slate-500">Todo lo necesario para sostener tu práctica: historia clínica, sesiones y evaluaciones.</p>
              </header>

              <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
                <div className="space-y-6">
                  <section className="rounded-[28px] border border-slate-100 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Prioridades</p>
                        <h3 className="text-xl font-semibold text-slate-900">Jornada clínica</h3>
                        <p className="text-sm text-slate-500">Lo mínimo que un terapeuta TCC revisa antes de entrar a sesión.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePanel('agenda')}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Ir a agenda
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Próxima sesión</p>
                        {highlightedSession ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-lg font-semibold text-slate-900">{highlightedSession.patient?.personalInfo?.fullName}</p>
                            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                              <span className="rounded-2xl bg-white px-3 py-1 shadow">
                                {new Date(highlightedSession.sessionDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="rounded-2xl bg-white px-3 py-1 shadow">Sesión #{highlightedSession.sessionNumber}</span>
                              <span className="rounded-2xl bg-white px-3 py-1 capitalize shadow">{highlightedSession.modality}</span>
                            </div>
                            <p className="text-sm text-slate-500">Objetivo: {highlightedSession.focus || 'Revisar tareas y ajustar plan'}</p>
                            {highlightedSession.patient?._id && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                  to={`/psychology/patients/${highlightedSession.patient._id}`}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Expediente
                                </Link>
                                <Link
                                  to={`/psychology/patients/${highlightedSession.patient._id}/session`}
                                  className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                  Nota
                                </Link>
                                <Link
                                  to={`/psychology/patients/${highlightedSession.patient._id}/clinical-history`}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Historia
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">No hay sesiones programadas hoy.</p>
                        )}
                      </article>

                      <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Riesgo activo</p>
                        <div className="mt-3">
                          {riskAlerts && riskAlerts.length > 0 ? (
                            <div className="space-y-3">
                              {riskAlerts.slice(0, 3).map((alert) => (
                                <div key={alert._id} className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-rose-800">{alert.patient?.personalInfo?.fullName}</p>
                                      <p className="text-sm text-rose-700">{alert.riskAlert?.reason || 'Alerta registrada'}</p>
                                    </div>
                                    {alert.patient?._id && (
                                      <Link
                                        to={`/psychology/patients/${alert.patient._id}`}
                                        className="rounded-2xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                      >
                                        Abrir
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <p className="text-xs text-slate-500">
                                Sugerencia TCC: documenta evaluación de riesgo, plan de seguridad y seguimiento.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Sin alertas críticas detectadas en este momento.</p>
                          )}
                        </div>
                      </article>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-100 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Medición</p>
                        <h3 className="text-xl font-semibold text-slate-900">Seguimiento basado en resultados</h3>
                        <p className="text-sm text-slate-500">Severidad actual + tendencia para ajustar hipótesis e intervención.</p>
                      </div>
                      <Link
                        to="/psychology/assessments/new"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Aplicar escala
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {severitySeries.map((series) => {
                        const band = getMeasureBand(series.name, series.last);
                        return (
                          <article key={`atajos-measure-${series.name}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{series.name}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">{series.last !== null ? series.last : '—'}</p>
                              </div>
                              <span className={`h-fit rounded-2xl border px-3 py-1 text-xs font-semibold ${band.tone}`}>{band.label}</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-600">
                              {series.delta !== null ? (
                                <span>
                                  Cambio: <span className="font-semibold text-slate-900">{series.delta > 0 ? '+' : ''}{series.delta}</span>
                                </span>
                              ) : (
                                <span>Sin comparación</span>
                              )}
                            </p>
                          </article>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Adherencia a tareas</p>
                      <p className="text-sm text-slate-500">Una señal fuerte de respuesta al tratamiento en TCC.</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-2xl font-semibold text-slate-900">{homework.percent || 0}%</span>
                        <span className="text-sm text-slate-500">{homework.completed} / {homework.total}</span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${homework.percent || 0}%` }} />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Tip clínico: define tareas específicas, graduadas, con barreras anticipadas y revisión explícita en sesión.
                      </p>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Evaluaciones y tests</p>
                        <h3 className="text-xl font-semibold text-slate-900">Aplicación rápida</h3>
                        <p className="text-sm text-slate-500">Escalas rápidas para formular, monitorear y ajustar el plan.</p>
                      </div>
                      <Link
                        to="/psychology/assessments/new"
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Abrir selector
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {assessmentShortcuts.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{item.subtitle}</p>
                          </div>
                          <span className="text-slate-400">→</span>
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                    <p className="text-sm font-semibold text-slate-500">Historia clínica</p>
                    <h3 className="text-xl font-semibold text-slate-900">Formulación, hipótesis y evolución</h3>
                    <p className="text-sm text-slate-500">Deja trazabilidad clínica: hipótesis de mantenimiento, objetivos y plan por etapas.</p>

                    <div className="mt-4 grid gap-3">
                      <Link
                        to="/psychology/clinical-history"
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Ver historias clínicas
                      </Link>
                      <Link
                        to="/psychology/patients"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Abrir un paciente y documentar
                      </Link>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                    <p className="text-sm font-semibold text-slate-500">Sesión TCC</p>
                    <h3 className="text-xl font-semibold text-slate-900">Planificar, ejecutar, seguir</h3>
                    <p className="text-sm text-slate-500">Estructura, tarea, seguimiento y cierre (sin perder consistencia).</p>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">Estructura sugerida (TCC)</p>
                      <ol className="mt-3 space-y-2 text-sm text-slate-600">
                        <li className="flex gap-2"><span className="font-semibold text-slate-900">1.</span> Agenda y puente con sesión previa</li>
                        <li className="flex gap-2"><span className="font-semibold text-slate-900">2.</span> Revisión de tareas (barreras y refuerzo)</li>
                        <li className="flex gap-2"><span className="font-semibold text-slate-900">3.</span> Intervención (cognitiva / conductual / exposición)</li>
                        <li className="flex gap-2"><span className="font-semibold text-slate-900">4.</span> Plan semanal + tarea graduada + prevención de recaídas</li>
                      </ol>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Link
                        to="/psychology/sessions/new"
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Crear nota de sesión
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActivePanel('agenda')}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Ver agenda de hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePanel('citas')}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Gestionar citas
                      </button>
                      <Link
                        to="/psychology/patients/new"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Registrar intake
                      </Link>
                    </div>
                  </section>
                </div>

                <section className="rounded-[28px] border border-slate-100 bg-white p-6">
                  <header className="mb-4">
                    <p className="text-sm font-semibold text-slate-500">Atajos</p>
                    <h3 className="text-xl font-semibold text-slate-900">Acciones rápidas</h3>
                    <p className="text-sm text-slate-500">Entradas directas para mantener ritmo y documentación clínica.</p>
                  </header>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {quickActions.map((action) => (
                      <Link
                        key={action.title}
                        to={action.to}
                        className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${action.gradient} p-5 text-white shadow-lg transition hover:translate-y-[-4px]`}
                      >
                        <div className="mb-4 w-fit rounded-2xl border border-white/20 bg-white/20 p-3 text-white">
                          {action.icon}
                        </div>
                        <p className="text-lg font-semibold">{action.title}</p>
                        <p className="text-sm text-white/80">{action.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </section>
        )}
      </div>
    </section>
  );
};

export default PsychologyDashboard;
