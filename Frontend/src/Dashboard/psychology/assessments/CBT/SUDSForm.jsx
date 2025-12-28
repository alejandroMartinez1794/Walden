import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../../config';
import Loading from '../../../../components/Loader/Loading';
import Error from '../../../../components/Error/Error';
import { useAuthToken } from '../../../../hooks/useAuthToken';

const clamp01to10 = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(10, v));
};

const SUDSForm = () => {
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
    sudsNow: 0,
    avoidanceNow: 0,
    urgeEscapeNow: 0,
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    if (!formData.situation.trim()) return toast.error('Describa la situación');

    try {
      setSubmitting(true);

      const payload = {
        patient: formData.patient,
        testType: 'SUDS / Evitación (Registro TCC)',
        testDate: formData.testDate,
        responses: [
          { itemNumber: 1, question: 'Situación (contexto breve)', response: formData.situation.trim() },
          { itemNumber: 2, question: 'SUDS ahora (0-10)', response: clamp01to10(formData.sudsNow) },
          { itemNumber: 3, question: 'Evitación ahora (0-10)', response: clamp01to10(formData.avoidanceNow) },
          { itemNumber: 4, question: 'Urgencia de escapar/evadir (0-10)', response: clamp01to10(formData.urgeEscapeNow) },
          { itemNumber: 5, question: 'Notas clínicas', response: formData.notes.trim() },
        ],
        scores: {
          suds: clamp01to10(formData.sudsNow),
          avoidance: clamp01to10(formData.avoidanceNow),
          urgeEscape: clamp01to10(formData.urgeEscapeNow),
        },
        interpretation: {
          severity: 'registro',
          notes: 'Registro abierto de TCC (no instrumento propietario). Útil para exposición/evitación y monitoreo entre sesiones.',
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Registro SUDS guardado');
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
        <h1 className="text-3xl font-bold text-headingColor">SUDS / Evitación</h1>
        <p className="text-textColor mt-1">Registro abierto de TCC (0–10) para exposición, evitación y monitoreo</p>
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
            <strong>Uso clínico:</strong> ideal para exposición graduada, prevención de respuesta y monitoreo entre sesiones.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Situación (contexto breve) *</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            rows={3}
            value={formData.situation}
            onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
            placeholder="¿Dónde estaba? ¿Qué pasaba? ¿Cuál fue el disparador?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">SUDS ahora (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.sudsNow}
              onChange={(e) => setFormData({ ...formData, sudsNow: clamp01to10(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-2">0 = nada de malestar, 10 = máximo malestar</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Evitación ahora (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.avoidanceNow}
              onChange={(e) => setFormData({ ...formData, avoidanceNow: clamp01to10(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-2">0 = nada, 10 = evitación total</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgencia de escapar (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.urgeEscapeNow}
              onChange={(e) => setFormData({ ...formData, urgeEscapeNow: clamp01to10(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-2">0 = ninguna, 10 = máxima urgencia</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Conductas de seguridad, exposición realizada, plan para repetir, etc."
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

export default SUDSForm;
