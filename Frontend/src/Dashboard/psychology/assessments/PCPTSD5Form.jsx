import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const items = [
  '¿Alguna vez tuvo pesadillas sobre el evento o pensó en él cuando no quería?',
  '¿Intentó no pensar en el evento o evitó recordatorios?',
  '¿Estuvo constantemente en alerta, vigilante o se asustaba fácilmente?',
  '¿Se sintió entumecido(a) o distanciado(a) de otras personas, actividades o entorno?',
  '¿Se sintió culpable o culpó de lo ocurrido a usted o a otros?'
];

const scoreToRisk = (score) => {
  if (score >= 4) return { label: 'Probable TEPT', color: 'text-red-600' };
  if (score === 3) return { label: 'Riesgo elevado', color: 'text-orange-600' };
  return { label: 'Riesgo bajo', color: 'text-green-600' };
};

const PCPTSD5Form = () => {
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
    responses: Array(5).fill(null),
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
      } catch (e) { setError(e.message); } finally { setLoading(false); }
    })();

    const pre = search.get('patient');
    if (pre) setFormData((prev) => ({ ...prev, patient: pre }));
  }, []);

  const setResponse = (idx, value) => {
    const updated = [...formData.responses];
    updated[idx] = value === 'yes';
    setFormData({ ...formData, responses: updated });
  };

  const totalYes = formData.responses.reduce((sum, v) => sum + (v ? 1 : 0), 0);
  const severity = scoreToRisk(totalYes);
  const allAnswered = formData.responses.every((v) => v !== null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    if (!allAnswered) return toast.error('Responda las 5 preguntas');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'PC-PTSD-5',
        testDate: formData.testDate,
        responses: formData.responses.map((resp, idx) => ({
          itemNumber: idx + 1,
          question: items[idx],
          response: resp ? 'Sí' : 'No',
          score: resp ? 1 : 0,
        })),
        scores: { total: totalYes },
        interpretation: {
          severity: severity.label,
          notes: `PC-PTSD-5 ${totalYes}/5. ${severity.label}.`,
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('PC-PTSD-5 guardado en el expediente');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">PC-PTSD-5</h1>
        <p className="text-textColor mt-1">Tamizaje breve de TEPT (dominio público, VA)</p>
        <p className="text-sm text-gray-500 mt-2">Punto de corte típico ≥4 sugiere TEPT probable; ≥3 riesgo elevado.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.patient}
            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
          >
            <option value="">Seleccione un paciente</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.personalInfo?.fullName}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
          />
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Consentimiento:</strong> Tamizaje de estrés postraumático. Los resultados deben interpretarse con entrevista clínica.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {items.map((q, idx) => (
            <div key={q} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">{idx + 1}. {q}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['yes', 'no'].map((val) => (
                  <label
                    key={val}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.responses[idx] === (val === 'yes')
                        ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={val}
                      checked={formData.responses[idx] === (val === 'yes')}
                      onChange={(e) => setResponse(idx, e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{val === 'yes' ? 'Sí' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm">Puntaje total</p>
            <p className="text-2xl font-bold">{totalYes} / 5</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Interpretación</p>
            <p className={`text-2xl font-bold ${severity.color}`}>{severity.label}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar PC-PTSD-5'}
        </button>
      </form>
    </div>
  );
};

export default PCPTSD5Form;
