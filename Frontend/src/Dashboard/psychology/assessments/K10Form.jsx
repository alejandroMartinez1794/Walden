import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const questions = [
  'En las últimas 4 semanas, ¿con qué frecuencia se sintió cansado sin motivo?',
  '¿Con qué frecuencia se sintió nervioso?',
  '¿Con qué frecuencia se sintió tan nervioso que nada podía tranquilizarle?',
  '¿Con qué frecuencia se sintió desesperanzado?',
  '¿Con qué frecuencia se sintió inquieto o intranquilo?',
  '¿Con qué frecuencia se sintió tan inquieto que no podía estar quieto?',
  '¿Con qué frecuencia se sintió desanimado y deprimido?',
  '¿Con qué frecuencia se sintió todo un esfuerzo?',
  '¿Con qué frecuencia se sintió tan triste que nada podía animarle?',
  '¿Con qué frecuencia se sintió sin valor?',
];

const options = [
  { value: 1, label: 'Nunca' },
  { value: 2, label: 'Pocas veces' },
  { value: 3, label: 'Algunas veces' },
  { value: 4, label: 'La mayoría de las veces' },
  { value: 5, label: 'Todo el tiempo' },
];

const interpret = (score) => {
  if (score >= 30) return { label: 'Muy alto', color: 'text-red-600' };
  if (score >= 22) return { label: 'Alto', color: 'text-orange-600' };
  if (score >= 16) return { label: 'Moderado', color: 'text-yellow-600' };
  return { label: 'Bajo', color: 'text-green-600' };
};

const K10Form = () => {
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
    responses: Array(10).fill(1),
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
    updated[idx] = Number(value);
    setFormData({ ...formData, responses: updated });
  };

  const total = useMemo(() => formData.responses.reduce((s, v) => s + Number(v || 0), 0), [formData.responses]);
  const severity = interpret(total);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'K10',
        testDate: formData.testDate,
        responses: formData.responses.map((score, idx) => ({
          itemNumber: idx + 1,
          question: questions[idx],
          response: score,
        })),
        scores: { total },
        interpretation: {
          severity: severity.label,
          notes: `K10 ${total}/50. ${severity.label} malestar psicológico.`,
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('K10 guardado en el expediente');
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
        <h1 className="text-3xl font-bold text-headingColor">K10</h1>
        <p className="text-textColor mt-1">Kessler Psychological Distress Scale (10 ítems)</p>
        <p className="text-sm text-gray-500 mt-2">Últimas 4 semanas. Rango 10-50 (1-5 por ítem).</p>
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
            <strong>Consentimiento:</strong> Medida de malestar psicológico. No es diagnóstico; interpretar junto a la entrevista clínica.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((q, idx) => (
            <div key={q} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">{idx + 1}. {q}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.map((o) => (
                  <label
                    key={o.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.responses[idx] === o.value
                        ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={o.value}
                      checked={formData.responses[idx] === o.value}
                      onChange={(e) => setResponse(idx, e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm">Puntaje total</p>
            <p className="text-2xl font-bold">{total} / 50</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Severidad</p>
            <p className={`text-2xl font-bold ${severity.color}`}>{severity.label}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar K10'}
        </button>
      </form>
    </div>
  );
};

export default K10Form;
