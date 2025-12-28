import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../../config';
import Loading from '../../../../components/Loader/Loading';
import Error from '../../../../components/Error/Error';
import { useAuthToken } from '../../../../hooks/useAuthToken';

const clamp0to100 = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
};

const ThoughtRecordForm = () => {
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
    situation: '',
    automaticThought: '',
    emotion: '',
    emotionIntensity: 0,
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    actionPlan: '',
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    if (!formData.situation.trim()) return toast.error('Describa la situación');
    if (!formData.automaticThought.trim()) return toast.error('Ingrese el pensamiento automático');

    try {
      setSubmitting(true);

      const payload = {
        patient: formData.patient,
        testType: 'Registro de Pensamientos (TCC)',
        testDate: formData.testDate,
        responses: [
          { itemNumber: 1, question: 'Situación', response: formData.situation.trim() },
          { itemNumber: 2, question: 'Pensamiento automático', response: formData.automaticThought.trim() },
          { itemNumber: 3, question: 'Emoción principal', response: formData.emotion.trim() },
          { itemNumber: 4, question: 'Intensidad de la emoción (0-100)', response: clamp0to100(formData.emotionIntensity) },
          { itemNumber: 5, question: 'Evidencia a favor', response: formData.evidenceFor.trim() },
          { itemNumber: 6, question: 'Evidencia en contra', response: formData.evidenceAgainst.trim() },
          { itemNumber: 7, question: 'Pensamiento alternativo balanceado', response: formData.alternativeThought.trim() },
          { itemNumber: 8, question: 'Plan de acción / experimento conductual', response: formData.actionPlan.trim() },
        ],
        scores: {
          emotionIntensity: clamp0to100(formData.emotionIntensity),
        },
        interpretation: {
          severity: 'registro',
          notes: 'Registro abierto de TCC (no instrumento propietario). Útil para reestructuración cognitiva y planificación de experimentos conductuales.',
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Registro de pensamientos guardado');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Registro de Pensamientos (TCC)</h1>
        <p className="text-textColor mt-1">Formato abierto de reestructuración cognitiva (no propietario)</p>
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
            <strong>Uso clínico:</strong> identifica pensamiento automático, evalúa evidencia y genera alternativa balanceada + plan de acción.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">1) Situación *</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.situation}
            onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
            placeholder="¿Qué pasó? ¿Dónde? ¿Con quién? ¿Qué lo disparó?"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">2) Pensamiento automático *</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={2}
            value={formData.automaticThought}
            onChange={(e) => setFormData({ ...formData, automaticThought: e.target.value })}
            placeholder='Ej: "Voy a fallar" / "Se van a dar cuenta"'
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3) Emoción principal</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.emotion}
              onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
              placeholder="Ej: ansiedad, tristeza, culpa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">4) Intensidad (0–100)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.emotionIntensity}
              onChange={(e) => setFormData({ ...formData, emotionIntensity: clamp0to100(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-2">0 = nada, 100 = máximo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">5) Evidencia a favor</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              value={formData.evidenceFor}
              onChange={(e) => setFormData({ ...formData, evidenceFor: e.target.value })}
              placeholder="Hechos observables, no suposiciones"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">6) Evidencia en contra</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              value={formData.evidenceAgainst}
              onChange={(e) => setFormData({ ...formData, evidenceAgainst: e.target.value })}
              placeholder="Datos que no encajan con el pensamiento"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">7) Pensamiento alternativo balanceado</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.alternativeThought}
            onChange={(e) => setFormData({ ...formData, alternativeThought: e.target.value })}
            placeholder="Más realista, flexible y útil"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">8) Plan de acción / experimento conductual</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.actionPlan}
            onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
            placeholder="Qué haré, cuándo, cómo mediré el resultado"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </form>
    </div>
  );
};

export default ThoughtRecordForm;
