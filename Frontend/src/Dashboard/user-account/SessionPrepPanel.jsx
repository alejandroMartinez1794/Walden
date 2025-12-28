import { useEffect, useMemo, useState, useContext } from 'react';
import { HiOutlineChatAlt2, HiOutlineCalendar } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import { authContext } from '../../context/AuthContext';

const EXPERIMENT_STATUSES = ['Pendiente', 'En progreso', 'Completado'];

// Default profile copied from PatientDashboard to keep data shape intact
const defaultProfile = {
  therapyGoal: '',
  lastMood: {
    label: 'Ansiedad',
    intensity: 35,
    updatedAt: null,
  },
  abcRecord: {
    trigger: '',
    thought: '',
    emotion: '',
    behavior: '',
    reframe: '',
  },
  microGoals: [],
  sessionPrompts: [
    '¿Qué evidencia nueva apareció esta semana sobre tu pensamiento automático?',
    'Describe una victoria, por pequeña que sea, que quieras compartir en sesión.',
    'Anota una pregunta abierta que quieras explorar con tu terapeuta.',
  ],
  behaviorExperiments: [],
  schemaHighlights: [],
  copingToolkit: [],
  safetyPlan: {
    signals: [],
    actions: [],
    emergency: '',
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

const SessionPrepPanel = ({ userData, onUserDataUpdate }) => {
  const { token } = useContext(authContext);
  const [cbtProfile, setCbtProfile] = useState(() => hydrateProfile(userData?.cbtProfile));
  const [sessionPromptDraft, setSessionPromptDraft] = useState('');
  const [newInsight, setNewInsight] = useState('');
  const [savingSection, setSavingSection] = useState(null);

  useEffect(() => {
    setCbtProfile(hydrateProfile(userData?.cbtProfile));
  }, [userData]);

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cbtProfile: nextProfile }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'No se pudo guardar los cambios');
      }

      const synced = hydrateProfile(payload.data?.cbtProfile || nextProfile);
      setCbtProfile(synced);
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

  const insightPlaceholder = useMemo(
    () => 'Anota una idea, pregunta o victoria para la próxima sesión',
    []
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineCalendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Agenda terapéutica sugerida</p>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Citas</span>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-slate-600">
          {cbtProfile.sessionPrompts.map((prompt, index) => (
            <li key={`${prompt}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2">
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
        <div className="flex gap-2">
          <input
            value={sessionPromptDraft}
            onChange={(e) => setSessionPromptDraft(e.target.value)}
            placeholder="Idea para próxima sesión"
            className="flex-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          />
          <button
            onClick={addSessionPrompt}
            disabled={isSaving('Agenda terapéutica')}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="glass-panel space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
            <HiOutlineChatAlt2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notas terapéuticas</p>
            <h3 className="text-lg font-semibold text-slate-900">Lo que deseas compartir en la próxima sesión</h3>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
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
              placeholder={insightPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm focus:border-slate-400 focus:outline-none"
            />
            <button
              onClick={addInsight}
              disabled={isSaving('Notas terapéuticas')}
              className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Añadir nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPrepPanel;
