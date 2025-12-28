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

const AvoidanceBehaviorsForm = () => {
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
    trigger: '',
    avoidedSituation: '',
    avoidanceBehavior: '',
    shortRelief: '',
    longCost: '',
    valuesBlocked: '',
    approachStep: '',
    distressNow: 0,
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
    if (!formData.avoidedSituation.trim()) return toast.error('Describa la situación evitada');

    try {
      setSubmitting(true);

      const payload = {
        patient: formData.patient,
        testType: 'Registro de conductas de evitación (TCC)',
        testDate: formData.testDate,
        responses: [
          { itemNumber: 1, question: 'Disparador / trigger', response: formData.trigger.trim() },
          { itemNumber: 2, question: 'Situación evitada', response: formData.avoidedSituation.trim() },
          { itemNumber: 3, question: 'Conducta de evitación', response: formData.avoidanceBehavior.trim() },
          { itemNumber: 4, question: 'Alivio a corto plazo', response: formData.shortRelief.trim() },
          { itemNumber: 5, question: 'Costo a largo plazo', response: formData.longCost.trim() },
          { itemNumber: 6, question: 'Valores/objetivos bloqueados', response: formData.valuesBlocked.trim() },
          { itemNumber: 7, question: 'Paso de aproximación (exposición/acción)', response: formData.approachStep.trim() },
          { itemNumber: 8, question: 'Malestar anticipado (0-10)', response: clamp0to10(formData.distressNow) },
        ],
        scores: {
          anticipatedDistress: clamp0to10(formData.distressNow),
        },
        interpretation: {
          severity: 'registro',
          notes: 'Registro abierto de evitación para diseñar aproximaciones graduadas / exposición. No propietario.',
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Registro de evitación guardado');
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
        <h1 className="text-3xl font-bold text-headingColor">Conductas de evitación (TCC)</h1>
        <p className="text-textColor mt-1">Registro abierto para trazar costo-beneficio y plan de aproximación</p>
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
            <strong>Uso clínico:</strong> desglosa evitación, clarifica costos y define un paso de aproximación medible.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">1) Disparador / trigger</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={formData.trigger}
            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
            placeholder="Situación, pensamiento o emoción que dispara la evitación"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">2) Situación evitada *</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.avoidedSituation}
            onChange={(e) => setFormData({ ...formData, avoidedSituation: e.target.value })}
            placeholder="Ej: hablar en junta, contestar llamadas, salir solo"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">3) Conducta de evitación</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.avoidanceBehavior}
            onChange={(e) => setFormData({ ...formData, avoidanceBehavior: e.target.value })}
            placeholder="Ej: posponer, delegar, distraerse, cancelar"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">4) Alivio a corto plazo</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.shortRelief}
              onChange={(e) => setFormData({ ...formData, shortRelief: e.target.value })}
              placeholder="¿Qué gana el paciente al evitar?"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">5) Costo a largo plazo</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.longCost}
              onChange={(e) => setFormData({ ...formData, longCost: e.target.value })}
              placeholder="Consecuencias en autoestima, relaciones, trabajo, valores"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">6) Valores u objetivos bloqueados</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.valuesBlocked}
              onChange={(e) => setFormData({ ...formData, valuesBlocked: e.target.value })}
              placeholder="Ej: conexión social, salud, crecimiento profesional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">7) Paso de aproximación (exposición/acción)</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.approachStep}
              onChange={(e) => setFormData({ ...formData, approachStep: e.target.value })}
              placeholder="Paso pequeño, medible, con fecha. Ej: hacer 1 llamada de 2 minutos."
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">8) Malestar anticipado (0–10)</label>
          <input
            type="number"
            min={0}
            max={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={formData.distressNow}
            onChange={(e) => setFormData({ ...formData, distressNow: clamp0to10(e.target.value) })}
          />
          <p className="text-xs text-gray-500 mt-2">0 = sin malestar, 10 = máximo</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar registro'}
        </button>
      </form>
    </div>
  );
};

export default AvoidanceBehaviorsForm;
