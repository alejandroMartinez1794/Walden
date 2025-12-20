import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineCalendar,
  HiOutlineHeart,
  HiOutlineClipboardList,
  HiOutlineLightningBolt,
  HiOutlineChatAlt2,
  HiOutlineBookOpen,
  HiOutlineAdjustments,
  HiOutlinePhone,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import { BASE_URL } from '../../config';
import patientAvatar from '../../assets/images/patient-avatar.png';

const EXPERIMENT_STATUSES = ['Pendiente', 'En progreso', 'Completado'];

const defaultProfile = {
  therapyGoal: 'Reducir la ansiedad social identificando y desafiando pensamientos automáticos antes de reuniones.',
  lastMood: {
    label: 'Ansiedad',
    intensity: 35,
    updatedAt: null,
  },
  abcRecord: {
    trigger: 'Situación social en el trabajo',
    thought: 'Voy a equivocarme y todos lo notarán',
    emotion: 'Ansiedad 35%',
    behavior: 'Evitó participar en la reunión',
    reframe: 'Preparé 3 ideas, puedo compartir solo una y observar la reacción real.',
  },
  microGoals: [
    { label: 'Registrar emoción + intensidad', done: true },
    { label: 'Completar un diario de pensamiento', done: false },
    { label: 'Aplicar técnica de respiración 4-7-8', done: false },
  ],
  sessionPrompts: [
    '¿Qué evidencia nueva apareció esta semana sobre tu pensamiento automático?',
    'Describe una victoria, por pequeña que sea, que quieras compartir en sesión.',
    'Anota una pregunta abierta que quieras explorar con tu terapeuta.',
  ],
  behaviorExperiments: [
    {
      name: 'Exposición gradual: conversación breve',
      status: 'Completado',
      reflection: 'La anticipación fue 70%, la emoción real bajó a 40% tras 5 minutos.',
    },
    {
      name: 'Registrar pensamiento automático',
      status: 'En progreso',
      reflection: 'Identifiqué catastrofismo y añadí evidencia alternativa escrita.',
    },
  ],
  schemaHighlights: [
    {
      name: 'Autoexigencia / desempeño',
      trigger: 'Feedback laboral',
      need: 'Validación equilibrada',
      action: 'Reformular meta realista y reconocer evidencia de progreso.',
    },
    {
      name: 'Aprobación externa',
      trigger: 'Silencio en conversaciones',
      need: 'Seguridad interna',
      action: 'Notar cualidades propias antes de buscar confirmación.',
    },
  ],
  copingToolkit: [
    { technique: 'Respiración 4-7-8', cue: 'Usar cuando la intensidad supere 60%.' },
    { technique: 'Grounding 5-4-3-2-1', cue: 'Tras un pensamiento intrusivo.' },
  ],
  safetyPlan: {
    signals: ['Insomnio + rumiación constante', 'Disminuye tolerancia a la frustración'],
    actions: ['Contactar a persona de confianza', 'Enviar mensaje al terapeuta'],
    emergency: '(555) 321-8899',
  },
  insights: [
    'Describe la emoción con porcentaje y sensación corporal para notar microcambios.',
    'Diseña acciones pequeñas que contradigan el pensamiento automático.',
  ],
};

const hydrateProfile = (profile = {}) => ({
  therapyGoal: profile.therapyGoal !== undefined ? profile.therapyGoal : defaultProfile.therapyGoal,
  lastMood: {
    ...defaultProfile.lastMood,
    ...(profile.lastMood || {}),
  },
  abcRecord: {
    ...defaultProfile.abcRecord,
    ...(profile.abcRecord || {}),
  },
  microGoals: (profile.microGoals?.length ? profile.microGoals : defaultProfile.microGoals).map((goal) => ({
    ...goal,
  })),
  sessionPrompts: [...(profile.sessionPrompts?.length ? profile.sessionPrompts : defaultProfile.sessionPrompts)],
  behaviorExperiments: (profile.behaviorExperiments?.length ? profile.behaviorExperiments : defaultProfile.behaviorExperiments).map((item) => ({
    ...item,
  })),
  schemaHighlights: (profile.schemaHighlights?.length ? profile.schemaHighlights : defaultProfile.schemaHighlights).map((item) => ({
    ...item,
  })),
  copingToolkit: (profile.copingToolkit?.length ? profile.copingToolkit : defaultProfile.copingToolkit).map((item) => ({
    ...item,
  })),
  safetyPlan: {
    ...defaultProfile.safetyPlan,
    ...(profile.safetyPlan || {}),
    signals: [
      ...(profile.safetyPlan?.signals?.length ? profile.safetyPlan.signals : defaultProfile.safetyPlan.signals),
    ],
    actions: [
      ...(profile.safetyPlan?.actions?.length ? profile.safetyPlan.actions : defaultProfile.safetyPlan.actions),
    ],
  },
  insights: [...(profile.insights?.length ? profile.insights : defaultProfile.insights)],
});

const PatientDashboard = ({ userData, bookingsCount = 0, onUserDataUpdate }) => {
  const firstName = userData?.name?.split(' ')[0] || 'Paciente';
  const profilePhoto = userData?.photo || patientAvatar;
  const [cbtProfile, setCbtProfile] = useState(() => hydrateProfile(userData?.cbtProfile));
  const [savingSection, setSavingSection] = useState(null);
  useEffect(() => {
    setCbtProfile(hydrateProfile(userData?.cbtProfile));
  }, [userData]);

  const intensity = Number(cbtProfile.lastMood.intensity) || 0;

  const profileCompletion = useMemo(() => {
    const fields = [
      Boolean(cbtProfile.therapyGoal?.trim()),
      Boolean(cbtProfile.lastMood.label?.trim()),
      Boolean(cbtProfile.abcRecord.reframe?.trim()),
      Boolean(cbtProfile.safetyPlan.emergency?.trim()),
      Boolean(userData?.photo),
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [cbtProfile, userData]);

  const statCards = useMemo(
    () => [
      {
        title: 'Intensidad emocional',
        value: `${intensity}%`,
        detail: intensity < 40 ? 'Regulación manejable' : 'Activa respiración + grounding antes de responder',
        icon: HiOutlineHeart,
        accent: 'from-sky-500/90 to-blue-600/90',
        surface: {
          '--glass-panel-bg': 'linear-gradient(140deg, rgba(14, 165, 233, 0.2), rgba(37, 99, 235, 0.25))',
          '--glass-panel-border': 'rgba(59, 130, 246, 0.45)',
          '--glass-panel-shadow': '0 25px 60px rgba(15, 76, 129, 0.35)',
          '--glass-panel-overlay': '0.35',
        },
      },
      {
        title: 'Sesión TCC',
        value: bookingsCount > 0 ? 'Confirmada' : 'Agendar',
        detail:
          bookingsCount > 0
            ? 'Prepara registro ABC y experimentos para sostener continuidad terapéutica.'
            : 'Agenda tu próxima sesión para mantener el ritmo.',
        icon: HiOutlineCalendar,
        accent: 'from-cyan-500/90 to-emerald-500/90',
        surface: {
          '--glass-panel-bg': 'linear-gradient(140deg, rgba(16, 185, 129, 0.2), rgba(8, 145, 178, 0.22))',
          '--glass-panel-border': 'rgba(13, 148, 136, 0.45)',
          '--glass-panel-shadow': '0 25px 60px rgba(5, 92, 104, 0.35)',
          '--glass-panel-overlay': '0.4',
        },
      },
      {
        title: 'Perfil terapéutico',
        value: `${profileCompletion}% completo`,
        detail:
          profileCompletion === 100
            ? 'Tu terapeuta cuenta con la información clave.'
            : 'Completa objetivo, registro emocional y plan de seguridad.',
        icon: HiOutlineClipboardList,
        accent: 'from-indigo-500/90 to-slate-600/90',
        surface: {
          '--glass-panel-bg': 'linear-gradient(140deg, rgba(79, 70, 229, 0.22), rgba(15, 118, 177, 0.18))',
          '--glass-panel-border': 'rgba(79, 70, 229, 0.35)',
          '--glass-panel-shadow': '0 25px 60px rgba(30, 41, 59, 0.35)',
          '--glass-panel-overlay': '0.3',
        },
      },
    ],
    [bookingsCount, intensity, profileCompletion]
  );

  const quickActions = [
    {
      title: 'Registro ABC',
      description: 'Activador, pensamiento, emoción y respuesta en un flujo guiado.',
      to: '/users/profile/me?tab=abc-log',
      icon: HiOutlineBookOpen,
      pill: 'Diario consciente',
    },
    {
      title: 'Agenda terapéutica',
      description: 'Lista de temas, señales y victorias para la próxima sesión.',
      to: '/services',
      icon: HiOutlineCalendar,
      pill: '5 min',
    },
    {
      title: 'Regulación inmediata',
      description: 'Respiración 4-7-8 + grounding 5 sentidos guiados.',
      to: '/resources/calming',
      icon: HiOutlineLightningBolt,
      pill: '3 min',
    },
  ];

  const persistProfile = async (nextProfile, sectionLabel) => {
    if (!userData?._id) {
      toast.error('No se encontró el usuario para guardar los cambios.');
      return;
    }

    setSavingSection(sectionLabel || 'general');
    try {
      const res = await fetch(`${BASE_URL}/users/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cbtProfile: nextProfile }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'No se pudo guardar los cambios');
      }

      const syncedProfile = hydrateProfile(payload.data?.cbtProfile || nextProfile);
      setCbtProfile(syncedProfile);
      onUserDataUpdate?.(payload.data);
      if (sectionLabel) {
        toast.success(`${sectionLabel} actualizado correctamente`);
      }
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error al guardar');
    } finally {
      setSavingSection(null);
    }
  };

  const saveTherapyGoal = () => {
    const nextProfile = { ...cbtProfile, therapyGoal: cbtProfile.therapyGoal || '' };
    setCbtProfile(nextProfile);
    persistProfile(nextProfile, 'Objetivo terapéutico');
  };

  const handleMoodChange = (field, value) => {
    setCbtProfile((prev) => ({
      ...prev,
      lastMood: {
        ...prev.lastMood,
        [field]: field === 'intensity' ? Number(value) : value,
      },
    }));
  };

  const saveMoodLog = () => {
    const nextProfile = {
      ...cbtProfile,
      lastMood: { ...cbtProfile.lastMood, updatedAt: new Date().toISOString() },
    };
    setCbtProfile(nextProfile);
    persistProfile(nextProfile, 'Registro emocional');
  };

  const handleAbcChange = (field, value) => {
    setCbtProfile((prev) => ({
      ...prev,
      abcRecord: {
        ...prev.abcRecord,
        [field]: value,
      },
    }));
  };

  const saveAbcRecord = () => {
    persistProfile(cbtProfile, 'Registro ABC');
  };

  const [microGoalDraft, setMicroGoalDraft] = useState('');
  const [sessionPromptDraft, setSessionPromptDraft] = useState('');
  const [newExperiment, setNewExperiment] = useState({ name: '', status: EXPERIMENT_STATUSES[0], reflection: '' });
  const [newSchema, setNewSchema] = useState({ name: '', trigger: '', need: '', action: '' });
  const [newTechnique, setNewTechnique] = useState({ technique: '', cue: '' });
  const [newInsight, setNewInsight] = useState('');

  const toggleMicroGoal = (index) => {
    setCbtProfile((prev) => {
      const updatedGoals = prev.microGoals.map((goal, idx) =>
        idx === index ? { ...goal, done: !goal.done } : goal
      );
      const nextProfile = { ...prev, microGoals: updatedGoals };
      persistProfile(nextProfile, 'Micrometas');
      return nextProfile;
    });
  };

  const addMicroGoal = () => {
    if (!microGoalDraft.trim()) return;
    setCbtProfile((prev) => {
      const updatedGoals = [...prev.microGoals, { label: microGoalDraft.trim(), done: false }];
      const nextProfile = { ...prev, microGoals: updatedGoals };
      persistProfile(nextProfile, 'Micrometas');
      return nextProfile;
    });
    setMicroGoalDraft('');
  };

  const removeMicroGoal = (index) => {
    setCbtProfile((prev) => {
      const updatedGoals = prev.microGoals.filter((_, idx) => idx !== index);
      const nextProfile = { ...prev, microGoals: updatedGoals };
      persistProfile(nextProfile, 'Micrometas');
      return nextProfile;
    });
  };

  const addSessionPrompt = () => {
    if (!sessionPromptDraft.trim()) return;
    setCbtProfile((prev) => {
      const updatedPrompts = [...prev.sessionPrompts, sessionPromptDraft.trim()];
      const nextProfile = { ...prev, sessionPrompts: updatedPrompts };
      persistProfile(nextProfile, 'Agenda terapéutica');
      return nextProfile;
    });
    setSessionPromptDraft('');
  };

  const removeSessionPrompt = (index) => {
    setCbtProfile((prev) => {
      const updatedPrompts = prev.sessionPrompts.filter((_, idx) => idx !== index);
      const nextProfile = { ...prev, sessionPrompts: updatedPrompts };
      persistProfile(nextProfile, 'Agenda terapéutica');
      return nextProfile;
    });
  };

  const updateExperimentField = (index, field, value) => {
    setCbtProfile((prev) => ({
      ...prev,
      behaviorExperiments: prev.behaviorExperiments.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addExperiment = () => {
    if (!newExperiment.name.trim()) {
      toast.info('Describe el experimento antes de agregarlo.');
      return;
    }
    setCbtProfile((prev) => ({
      ...prev,
      behaviorExperiments: [...prev.behaviorExperiments, { ...newExperiment }],
    }));
    setNewExperiment({ name: '', status: EXPERIMENT_STATUSES[0], reflection: '' });
  };

  const removeExperiment = (index) => {
    setCbtProfile((prev) => ({
      ...prev,
      behaviorExperiments: prev.behaviorExperiments.filter((_, idx) => idx !== index),
    }));
    const nextProfile = {
      ...cbtProfile,
      behaviorExperiments: cbtProfile.behaviorExperiments.filter((_, idx) => idx !== index),
    };
    persistProfile(nextProfile, 'Experimentos');
  };

  const saveExperiments = () => {
    persistProfile(cbtProfile, 'Experimentos');
  };

  const updateSchemaField = (index, field, value) => {
    setCbtProfile((prev) => ({
      ...prev,
      schemaHighlights: prev.schemaHighlights.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSchema = () => {
    if (!newSchema.name.trim()) {
      toast.info('Nombra el esquema para guardarlo.');
      return;
    }
    setCbtProfile((prev) => ({
      ...prev,
      schemaHighlights: [...prev.schemaHighlights, { ...newSchema }],
    }));
    setNewSchema({ name: '', trigger: '', need: '', action: '' });
  };

  const removeSchema = (index) => {
    setCbtProfile((prev) => ({
      ...prev,
      schemaHighlights: prev.schemaHighlights.filter((_, idx) => idx !== index),
    }));
    const nextProfile = {
      ...cbtProfile,
      schemaHighlights: cbtProfile.schemaHighlights.filter((_, idx) => idx !== index),
    };
    persistProfile(nextProfile, 'Esquemas nucleares');
  };

  const saveSchemas = () => {
    persistProfile(cbtProfile, 'Esquemas nucleares');
  };

  const addTechnique = () => {
    if (!newTechnique.technique.trim()) {
      toast.info('Describe la técnica antes de guardarla.');
      return;
    }
    setCbtProfile((prev) => {
      const updatedToolkit = [...prev.copingToolkit, { ...newTechnique }];
      const nextProfile = { ...prev, copingToolkit: updatedToolkit };
      persistProfile(nextProfile, 'Caja de herramientas');
      return nextProfile;
    });
    setNewTechnique({ technique: '', cue: '' });
  };

  const removeTechnique = (index) => {
    setCbtProfile((prev) => {
      const updatedToolkit = prev.copingToolkit.filter((_, idx) => idx !== index);
      const nextProfile = { ...prev, copingToolkit: updatedToolkit };
      persistProfile(nextProfile, 'Caja de herramientas');
      return nextProfile;
    });
  };

  const updateSafetyPlanList = (field, value) => {
    const entries = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    setCbtProfile((prev) => ({
      ...prev,
      safetyPlan: {
        ...prev.safetyPlan,
        [field]: entries,
      },
    }));
  };

  const updateSafetyPlanField = (field, value) => {
    setCbtProfile((prev) => ({
      ...prev,
      safetyPlan: {
        ...prev.safetyPlan,
        [field]: value,
      },
    }));
  };

  const saveSafetyPlan = () => {
    persistProfile(cbtProfile, 'Plan de seguridad');
  };

  const addInsight = () => {
    if (!newInsight.trim()) return;
    setCbtProfile((prev) => {
      const updatedInsights = [...prev.insights, newInsight.trim()];
      const nextProfile = { ...prev, insights: updatedInsights };
      persistProfile(nextProfile, 'Notas terapéuticas');
      return nextProfile;
    });
    setNewInsight('');
  };

  const removeInsight = (index) => {
    setCbtProfile((prev) => {
      const updated = prev.insights.filter((_, idx) => idx !== index);
      const nextProfile = { ...prev, insights: updated };
      persistProfile(nextProfile, 'Notas terapéuticas');
      return nextProfile;
    });
  };

  const isSaving = (label) => savingSection === label;

  return (
    <section className="relative w-full overflow-hidden rounded-[40px] border border-[#101430]/80 bg-gradient-to-br from-[#080b16] via-[#101732] to-[#1b2647] p-1 shadow-[0_45px_120px_rgba(7,10,25,0.7)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 15%, rgba(59, 130, 246, 0.35), transparent 45%), radial-gradient(circle at 85% 0%, rgba(14, 165, 233, 0.25), transparent 40%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.22), transparent 45%)',
        }}
      />
      <div
        className="relative space-y-10 w-full rounded-[34px] border border-white/10 p-8 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(140deg, rgba(8, 12, 24, 0.96), rgba(14, 24, 44, 0.93), rgba(24, 37, 68, 0.9))',
        }}
      >
        <div
        className="relative overflow-hidden rounded-[32px] border border-white/20 p-8 text-white shadow-[0_35px_90px_rgba(5,8,20,0.65)]"
        style={{ background: 'linear-gradient(120deg, #0f1f3c, #1f3160 55%, #2d4a82)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.25), transparent 35%)',
          }}
        />
        <div className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-center">
          <div className="space-y-5">
            <span className="chip-soft bg-white/15 text-white/80">Terapia cognitivo-conductual</span>
            <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Hola, {firstName}. Este tablero resume tus patrones para que trabajemos con intención y compasión.
            </h1>
            <p className="text-lg text-white/80">
              Actualiza cada bloque con tus registros reales. Todo lo que completes alimenta la conversación terapéutica.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="chip-soft bg-white/10 text-white/80">Observación sin juicio</span>
              <span className="chip-soft bg-white/10 text-white/80">Intervenciones basadas en evidencia</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div
                className="flex min-w-[220px] flex-1 items-center gap-4 rounded-3xl border border-white/10 p-4 shadow-xl backdrop-blur"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 24, 45, 0.92), rgba(21, 34, 58, 0.88))',
                }}
              >
                <img
                  src={profilePhoto}
                  alt={`Foto de ${userData?.name || 'paciente'}`}
                  className="h-16 w-16 rounded-2xl border border-white/40 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Perfil terapéutico</p>
                  <p className="text-sm text-white">{userData?.email || 'Sin correo registrado'}</p>
                </div>
              </div>
              <div
                className="flex-1 rounded-3xl border border-white/15 p-4 backdrop-blur"
                style={{
                  background: 'linear-gradient(135deg, rgba(17, 28, 52, 0.9), rgba(33, 50, 84, 0.84))',
                }}
              >
                <label className="text-sm font-semibold tracking-wide text-white">
                  Objetivo terapéutico activo
                  <textarea
                    value={cbtProfile.therapyGoal}
                    onChange={(e) =>
                      setCbtProfile((prev) => ({ ...prev, therapyGoal: e.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/20 p-3 text-sm text-white placeholder-white/80 focus:border-cyan-200 focus:outline-none"
                    style={{ background: 'rgba(4, 9, 20, 0.65)' }}
                    rows={3}
                    placeholder="Describe el objetivo que estás trabajando."
                  />
                </label>
                <button
                  onClick={saveTherapyGoal}
                  disabled={isSaving('Objetivo terapéutico')}
                  className="mt-3 inline-flex items-center justify-center rounded-2xl bg-cyan-100/90 px-4 py-2 text-sm font-semibold text-[#0b132a] shadow hover:bg-cyan-50"
                >
                  {isSaving('Objetivo terapéutico') ? 'Guardando...' : 'Guardar objetivo'}
                </button>
              </div>
            </div>
          </div>
          <div
            className="glass-panel w-full text-white backdrop-blur"
            style={{
              '--glass-panel-bg': 'rgba(11, 17, 33, 0.85)',
              '--glass-panel-border': 'rgba(255, 255, 255, 0.15)',
              '--glass-panel-shadow': '0 35px 90px rgba(4, 7, 20, 0.65)',
              '--glass-panel-overlay': '0.15',
            }}
          >
            <p className="text-sm font-semibold text-white/70">Estado del proceso</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {bookingsCount > 0 ? 'Sesión confirmada' : 'Agenda para continuar'}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {bookingsCount > 0
                ? 'Enumera ideas, victorias y preguntas para aprovechar la sesión.'
                : 'Escoge una fecha para sostener el ritmo terapéutico.'}
            </p>
            <Link
              to="/services"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-[#1b1c3b] shadow hover:bg-white"
            >
              Preparar próxima sesión
            </Link>
          </div>
        </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.title} className="glass-panel p-6" style={card.surface}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.title}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] items-start">
        <div className="glass-panel space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Observación cognitiva</p>
              <h2 className="text-xl font-semibold text-slate-900">Registro ABC + distorsiones identificadas</h2>
            </div>
            <span className="chip-soft bg-slate-100 text-slate-600">Actualiza a diario</span>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/70 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {['trigger', 'thought', 'emotion', 'behavior'].map((field) => (
                <label key={field} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {field === 'trigger' && 'Disparador'}
                  {field === 'thought' && 'Pensamiento automático'}
                  {field === 'emotion' && 'Emoción / intensidad'}
                  {field === 'behavior' && 'Conducta'}
                  <textarea
                    value={cbtProfile.abcRecord[field]}
                    onChange={(e) => handleAbcChange(field, e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Respuesta alternativa
                <textarea
                  value={cbtProfile.abcRecord.reframe}
                  onChange={(e) => handleAbcChange('reframe', e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                />
              </label>
            </div>
            <button
              onClick={saveAbcRecord}
              disabled={isSaving('Registro ABC')}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isSaving('Registro ABC') ? 'Guardando...' : 'Guardar registro ABC'}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Registro emocional</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-600">
                Emoción predominante
                <input
                  value={cbtProfile.lastMood.label}
                  onChange={(e) => handleMoodChange('label', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  placeholder="Ansiedad, tristeza, etc."
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Intensidad (%): {intensity}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={intensity}
                  onChange={(e) => handleMoodChange('intensity', e.target.value)}
                  className="mt-2 w-full"
                />
              </label>
            </div>
            <button
              onClick={saveMoodLog}
              disabled={isSaving('Registro emocional')}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isSaving('Registro emocional') ? 'Guardando...' : 'Registrar estado'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Micrometas TCC</p>
              <h3 className="text-xl font-semibold text-slate-900">Mantén la práctica entre sesiones</h3>
            </div>
            <div className="space-y-3">
              {cbtProfile.microGoals.map((task, index) => (
                <div key={`${task.label}-${index}`} className="flex items-start justify-between gap-3 text-sm text-slate-600">
                  <label className="flex flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleMicroGoal(index)}
                      className="mt-1 h-4 w-4 rounded border-0 bg-primaryColor/10 text-primaryColor focus:ring-0"
                    />
                    <span className={task.done ? 'line-through text-slate-400' : 'text-slate-700'}>{task.label}</span>
                  </label>
                  <button
                    onClick={() => removeMicroGoal(index)}
                    className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={microGoalDraft}
                onChange={(e) => setMicroGoalDraft(e.target.value)}
                placeholder="Nueva micrometa"
                className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={addMicroGoal}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
              >
                Añadir
              </button>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Agenda terapéutica sugerida</p>
              <ul className="mt-3 space-y-2">
                {cbtProfile.sessionPrompts.map((prompt, index) => (
                  <li key={`${prompt}-${index}`} className="flex items-start justify-between gap-3">
                    <span className="flex-1">{prompt}</span>
                    <button
                      onClick={() => removeSessionPrompt(index)}
                      className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={sessionPromptDraft}
                  onChange={(e) => setSessionPromptDraft(e.target.value)}
                  placeholder="Idea para próxima sesión"
                  className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
                <button
                  onClick={addSessionPrompt}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Acciones guiadas</p>
                <h3 className="text-xl font-semibold text-slate-900">Flujos rápidos</h3>
              </div>
              <span className="chip-soft bg-slate-100 text-slate-600">Elige uno</span>
            </div>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-900/10 p-3 text-slate-900">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{action.title}</p>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{action.pill}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel h-full">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineLightningBolt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Experimentos conductuales</p>
              <h3 className="text-xl font-semibold text-slate-900">Documenta los aprendizajes centrales</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {cbtProfile.behaviorExperiments.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-3xl border border-slate-100 bg-white/70 p-5 space-y-3">
                <input
                  value={item.name}
                  onChange={(e) => updateExperimentField(index, 'name', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
                />
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={item.status}
                    onChange={(e) => updateExperimentField(index, 'status', e.target.value)}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                  >
                    {EXPERIMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeExperiment(index)}
                    className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                  >
                    Quitar
                  </button>
                </div>
                <textarea
                  value={item.reflection}
                  onChange={(e) => updateExperimentField(index, 'reflection', e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                  placeholder="¿Qué aprendiste?"
                />
              </div>
            ))}
            <div className="rounded-3xl border border-dashed border-slate-200 p-5 space-y-3">
              <input
                value={newExperiment.name}
                onChange={(e) => setNewExperiment((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Experimento"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <select
                value={newExperiment.status}
                onChange={(e) => setNewExperiment((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
              >
                {EXPERIMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <textarea
                value={newExperiment.reflection}
                onChange={(e) => setNewExperiment((prev) => ({ ...prev, reflection: e.target.value }))}
                rows={3}
                placeholder="Reflexión inicial"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={addExperiment}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Añadir experimento
              </button>
            </div>
            <button
              onClick={saveExperiments}
              disabled={isSaving('Experimentos')}
              className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {isSaving('Experimentos') ? 'Guardando...' : 'Guardar experimentos'}
            </button>
          </div>
        </div>

        <div className="glass-panel h-full">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineLightBulb className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Esquemas nucleares</p>
              <h3 className="text-xl font-semibold text-slate-900">Identifica el patrón y la necesidad asociada</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {cbtProfile.schemaHighlights.map((schema, index) => (
              <div key={`${schema.name}-${index}`} className="rounded-3xl border border-slate-100 bg-white/70 p-5 space-y-3">
                {['name', 'trigger', 'need', 'action'].map((field) => (
                  <label key={field} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {field === 'name' && 'Esquema'}
                    {field === 'trigger' && 'Disparador'}
                    {field === 'need' && 'Necesidad'}
                    {field === 'action' && 'Acción'}
                    <input
                      value={schema[field]}
                      onChange={(e) => updateSchemaField(index, field, e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                    />
                  </label>
                ))}
                <button
                  onClick={() => removeSchema(index)}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                >
                  Quitar esquema
                </button>
              </div>
            ))}
            <div className="rounded-3xl border border-dashed border-slate-200 p-5 space-y-2">
              {['name', 'trigger', 'need', 'action'].map((field) => (
                <input
                  key={field}
                  value={newSchema[field]}
                  onChange={(e) => setNewSchema((prev) => ({ ...prev, [field]: e.target.value }))}
                  placeholder={
                    field === 'name'
                      ? 'Nombre del esquema'
                      : field === 'trigger'
                      ? 'Disparador'
                      : field === 'need'
                      ? 'Necesidad'
                      : 'Acción alternativa'
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              ))}
              <button
                onClick={addSchema}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Añadir esquema
              </button>
            </div>
            <button
              onClick={saveSchemas}
              disabled={isSaving('Esquemas nucleares')}
              className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {isSaving('Esquemas nucleares') ? 'Guardando...' : 'Guardar esquemas'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineAdjustments className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Caja de herramientas</p>
              <h3 className="text-xl font-semibold text-slate-900">Técnicas de regulación guiadas</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {cbtProfile.copingToolkit.map((tool, index) => (
              <div key={`${tool.technique}-${index}`} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <HiOutlineAdjustments className="mt-1 h-6 w-6 text-primaryColor" />
                  <div>
                    <input
                      value={tool.technique}
                      onChange={(e) =>
                        setCbtProfile((prev) => ({
                          ...prev,
                          copingToolkit: prev.copingToolkit.map((entry, idx) =>
                            idx === index ? { ...entry, technique: e.target.value } : entry
                          ),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                    <input
                      value={tool.cue}
                      onChange={(e) =>
                        setCbtProfile((prev) => ({
                          ...prev,
                          copingToolkit: prev.copingToolkit.map((entry, idx) =>
                            idx === index ? { ...entry, cue: e.target.value } : entry
                          ),
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeTechnique(index)}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                >
                  Quitar
                </button>
              </div>
            ))}
            <div className="rounded-3xl border border-dashed border-slate-200 p-4 space-y-2">
              <input
                value={newTechnique.technique}
                onChange={(e) => setNewTechnique((prev) => ({ ...prev, technique: e.target.value }))}
                placeholder="Técnica"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <input
                value={newTechnique.cue}
                onChange={(e) => setNewTechnique((prev) => ({ ...prev, cue: e.target.value }))}
                placeholder="Cuándo usarla"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={addTechnique}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Añadir técnica
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-rose-100 bg-gradient-to-br from-rose-50 to-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
              <HiOutlinePhone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-400">Plan de seguridad</p>
              <h3 className="text-xl font-semibold text-rose-900">Activa el protocolo cuando lo necesites</h3>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-rose-400">
              Señales tempranas
              <textarea
                value={cbtProfile.safetyPlan.signals.join('\n')}
                onChange={(e) => updateSafetyPlanList('signals', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-rose-200 bg-white/80 p-3 text-sm text-rose-900 focus:border-rose-300 focus:outline-none"
                placeholder="Escribe una señal por línea"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-rose-400">
              Acciones acordadas
              <textarea
                value={cbtProfile.safetyPlan.actions.join('\n')}
                onChange={(e) => updateSafetyPlanList('actions', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-rose-200 bg-white/80 p-3 text-sm text-rose-900 focus:border-rose-300 focus:outline-none"
                placeholder="Escribe una acción por línea"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-rose-400">
              Contacto de emergencia
              <input
                value={cbtProfile.safetyPlan.emergency}
                onChange={(e) => updateSafetyPlanField('emergency', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-rose-200 bg-white/80 px-3 py-2 text-sm text-rose-900 focus:border-rose-300 focus:outline-none"
                placeholder="(XXX) XXX-XXXX"
              />
            </label>
            <button
              onClick={saveSafetyPlan}
              disabled={isSaving('Plan de seguridad')}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-rose-700"
            >
              {isSaving('Plan de seguridad') ? 'Guardando...' : 'Guardar plan de seguridad'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
            <HiOutlineChatAlt2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notas terapéuticas</p>
            <h3 className="text-xl font-semibold text-slate-900">Lo que deseas compartir en la próxima sesión</h3>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          {cbtProfile.insights.map((tip, index) => (
            <div key={`${tip}-${index}`} className="flex items-start justify-between gap-3 rounded-3xl border border-slate-100 bg-white/70 p-4">
              <p className="flex-1">{tip}</p>
              <button
                onClick={() => removeInsight(index)}
                className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
              >
                Quitar
              </button>
            </div>
          ))}
          <div className="rounded-3xl border border-dashed border-slate-200 p-4 space-y-3">
            <textarea
              value={newInsight}
              onChange={(e) => setNewInsight(e.target.value)}
              rows={3}
              placeholder="Anota una idea, pregunta o victoria para la próxima sesión"
              className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
            />
            <button
              onClick={addInsight}
              className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Añadir nota
            </button>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default PatientDashboard;
