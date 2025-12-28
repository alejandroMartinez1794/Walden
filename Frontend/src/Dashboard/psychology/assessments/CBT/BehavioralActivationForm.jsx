import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../../config';
import Loading from '../../../../components/Loader/Loading';
import Error from '../../../../components/Error/Error';
import { useAuthToken } from '../../../../hooks/useAuthToken';

const clamp0to10 = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(10, v));
};

const blankActivity = () => ({
  name: '',
  why: '',
  predictedMood: 0,
  actualMood: 0,
  difficulty: 0,
  nextStep: '',
});

const BehavioralActivationForm = () => {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    activities: [blankActivity()],
    notes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/psychology/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setPatients(json.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    const preselected = search.get('patient');
    if (preselected) setFormData((d) => ({ ...d, patient: preselected }));
  }, []);

  const updateActivity = (index, key, value) => {
    setFormData((d) => {
      const updated = d.activities.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));
      return { ...d, activities: updated };
    });
  };

  const addActivity = () => {
    setFormData((d) => ({ ...d, activities: [...d.activities, blankActivity()] }));
  };

  const removeActivity = (index) => {
    setFormData((d) => {
      const updated = d.activities.filter((_, idx) => idx !== index);
      return { ...d, activities: updated.length ? updated : [blankActivity()] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');

    const cleanedActivities = formData.activities
      .map((a) => ({
        ...a,
        name: a.name.trim(),
        why: a.why.trim(),
        nextStep: a.nextStep.trim(),
        predictedMood: clamp0to10(a.predictedMood),
        actualMood: clamp0to10(a.actualMood),
        difficulty: clamp0to10(a.difficulty),
      }))
      .filter((a) => a.name || a.why || a.nextStep);

    if (!cleanedActivities.length) return toast.error('Agregue al menos una actividad');

    try {
      setSubmitting(true);

      const responses = cleanedActivities.map((a, idx) => ({
        itemNumber: idx + 1,
        question: `Actividad ${idx + 1}`,
        response: `Actividad: ${a.name} | Propósito: ${a.why} | Estado de ánimo anticipado: ${a.predictedMood}/10 | Estado de ánimo posterior: ${a.actualMood}/10 | Dificultad: ${a.difficulty}/10 | Próximo paso: ${a.nextStep}`,
      }));

      const avgMoodBefore =
        cleanedActivities.reduce((acc, a) => acc + a.predictedMood, 0) / cleanedActivities.length;
      const avgMoodAfter = cleanedActivities.reduce((acc, a) => acc + a.actualMood, 0) / cleanedActivities.length;

      const payload = {
        patient: formData.patient,
        testType: 'Plan de activación conductual (TCC)',
        testDate: formData.testDate,
        responses,
        scores: {
          averageMoodBefore: Number.isFinite(avgMoodBefore) ? Number(avgMoodBefore.toFixed(2)) : 0,
          averageMoodAfter: Number.isFinite(avgMoodAfter) ? Number(avgMoodAfter.toFixed(2)) : 0,
          activityCount: cleanedActivities.length,
        },
        interpretation: {
          severity: 'registro',
          notes: 'Formato abierto de activación conductual con estimación de estado de ánimo y dificultad. No propietario.',
        },
        notes: formData.notes.trim(),
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Plan de activación guardado');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Activación conductual (TCC)</h1>
        <p className="text-textColor mt-1">Planifica actividades con propósito, mide estado de ánimo y dificultad</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.patient}
            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
          >
            <option value="">Seleccione un paciente</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.personalInfo?.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro *</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
          />
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Uso clínico:</strong> enlaza actividades con valores, anticipa y monitorea estado de ánimo, y ajusta próximos pasos.
          </p>
        </div>

        <div className="space-y-6 mb-6">
          {formData.activities.map((activity, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-headingColor">Actividad #{index + 1}</h3>
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => removeActivity(index)}
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actividad *</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={activity.name}
                    onChange={(e) => updateActivity(index, 'name', e.target.value)}
                    placeholder="Ej: caminar 15 min, llamar a un amigo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Propósito / valor</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={activity.why}
                    onChange={(e) => updateActivity(index, 'why', e.target.value)}
                    placeholder="Conexión, salud, dominio, sentido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de ánimo anticipado (0–10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={activity.predictedMood}
                    onChange={(e) => updateActivity(index, 'predictedMood', clamp0to10(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de ánimo posterior (0–10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={activity.actualMood}
                    onChange={(e) => updateActivity(index, 'actualMood', clamp0to10(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad percibida (0–10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={activity.difficulty}
                    onChange={(e) => updateActivity(index, 'difficulty', clamp0to10(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Próximo paso / ajuste</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  value={activity.nextStep}
                  onChange={(e) => updateActivity(index, 'nextStep', e.target.value)}
                  placeholder="¿Qué ajuste harás la próxima vez?"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            type="button"
            className="text-primaryColor font-semibold hover:underline"
            onClick={addActivity}
          >
            + Agregar actividad
          </button>
          <span className="text-sm text-gray-500">Suma actividades cortas, factibles y ligadas a valores.</span>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas clínicas (opcional)</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Barreras previstas, apoyos, logística"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar plan'}
        </button>
      </form>
    </div>
  );
};

export default BehavioralActivationForm;
