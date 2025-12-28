import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const questions = [
  'Dolor de estómago',
  'Dolor de espalda',
  'Dolor en brazos, piernas o articulaciones',
  'Menstrual (si aplica)',
  'Dolor de cabeza',
  'Dolor o problemas durante la relación sexual',
  'Dolor u opresión en el pecho',
  'Mareos',
  'Desmayos',
  'Palpitaciones o corazón acelerado',
  'Falta de aire',
  'Problemas estomacales, náuseas, indigestión',
  'Problemas para vaciar intestinos / estreñimiento',
  'Nauseas, gases o digestión dificultosa',
  'Cansancio o poca energía',
];

const options = [
  { value: 0, label: 'Para nada' },
  { value: 1, label: 'Un poco' },
  { value: 2, label: 'Mucho' },
];

const interpret = (total) => {
  if (total >= 15) return { label: 'Alta', color: 'text-red-600' };
  if (total >= 10) return { label: 'Moderada', color: 'text-orange-600' };
  if (total >= 5) return { label: 'Leve', color: 'text-yellow-600' };
  return { label: 'Mínima', color: 'text-green-600' };
};

const PHQ15Form = () => {
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
    responses: Array(15).fill(0),
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
    if (preselected) setFormData((prev) => ({ ...prev, patient: preselected }));
  }, []);

  const setResponse = (idx, value) => {
    const updated = [...formData.responses];
    updated[idx] = Number(value);
    setFormData({ ...formData, responses: updated });
  };

  const total = formData.responses.reduce((sum, v) => sum + Number(v || 0), 0);
  const severity = interpret(total);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'PHQ-15',
        testDate: formData.testDate,
        responses: formData.responses.map((score, idx) => ({
          itemNumber: idx + 1,
          question: questions[idx],
          response: score,
        })),
        scores: { total },
        interpretation: {
          severity: severity.label,
          notes: `PHQ-15 ${total}/30. ${severity.label}.`,
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('PHQ-15 guardado en el expediente');
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
        <h1 className="text-3xl font-bold text-headingColor">PHQ-15</h1>
        <p className="text-textColor mt-1">Síntomas somáticos (Pfizer/PHQ Screeners)</p>
        <p className="text-sm text-gray-500 mt-2">Últimas 4 semanas. Sumar las respuestas 0-2 para un rango 0-30.</p>
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
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.personalInfo?.fullName}
              </option>
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
            <strong>Consentimiento:</strong> Instrumento de tamizaje somático. Los resultados se interpretan en conjunto con la clínica del profesional.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((q, idx) => (
            <div key={q} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">{idx + 1}. {q}</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <p className="text-2xl font-bold">{total} / 30</p>
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
          {submitting ? 'Guardando...' : 'Guardar PHQ-15'}
        </button>
      </form>
    </div>
  );
};

export default PHQ15Form;
