import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const questions = [
  'Me he sentido alegre y de buen ánimo',
  'Me he sentido tranquilo(a) y relajado(a)',
  'Me he sentido activo(a) y con energía',
  'Me he despertado sintiéndome fresco(a) y descansado(a)',
  'Mi vida diaria ha estado llena de cosas que me interesan',
];

const options = [
  { value: 0, label: 'En ningún momento' },
  { value: 1, label: 'Muy raras veces' },
  { value: 2, label: 'Menos de la mitad del tiempo' },
  { value: 3, label: 'Más de la mitad del tiempo' },
  { value: 4, label: 'Casi siempre' },
  { value: 5, label: 'Todo el tiempo' },
];

const getInterpretation = (scaledScore) => {
  if (scaledScore >= 70) return { label: 'Bienestar alto', color: 'text-green-600' };
  if (scaledScore >= 50) return { label: 'Vigilar cambios', color: 'text-yellow-600' };
  return { label: 'Riesgo clínico (<50)', color: 'text-red-600' };
};

const WHO5Form = () => {
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
    responses: Array(5).fill(0),
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
    if (preselected) {
      setFormData((prev) => ({ ...prev, patient: preselected }));
    }
  }, []);

  const setResponse = (idx, value) => {
    const updated = [...formData.responses];
    updated[idx] = Number(value);
    setFormData({ ...formData, responses: updated });
  };

  const rawScore = formData.responses.reduce((sum, value) => sum + Number(value || 0), 0);
  const scaledScore = rawScore * 4; // 0-100
  const severity = getInterpretation(scaledScore);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'WHO-5',
        testDate: formData.testDate,
        responses: formData.responses.map((score, index) => ({
          itemNumber: index + 1,
          question: questions[index],
          response: score,
        })),
        scores: {
          raw: rawScore,
          scaled: scaledScore,
        },
        interpretation: {
          severity: severity.label,
          notes: `WHO-5 ${scaledScore}/100. ${severity.label}.`,
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

      toast.success('WHO-5 guardado en el expediente');
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
        <h1 className="text-3xl font-bold text-headingColor">WHO-5 Well-Being Index</h1>
        <p className="text-textColor mt-1">Indicador de bienestar subjetivo recomendado por la OMS.</p>
        <p className="text-sm text-gray-500 mt-2">
          Cada ítem se responde según la frecuencia durante las últimas dos semanas.
        </p>
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
            <strong>Consentimiento:</strong> Este instrumento es un tamizaje de bienestar. Los resultados serán interpretados por su profesional de salud mental.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={question} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {index + 1}. {question}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.responses[index] === option.value
                        ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.value}
                      checked={formData.responses[index] === option.value}
                      onChange={(e) => setResponse(index, e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm">Puntaje bruto</p>
            <p className="text-2xl font-bold">{rawScore} / 25</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Puntaje escalado (x4)</p>
            <p className="text-2xl font-bold">{scaledScore} / 100</p>
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
          {submitting ? 'Guardando...' : 'Guardar WHO-5'}
        </button>
      </form>
    </div>
  );
};

export default WHO5Form;
