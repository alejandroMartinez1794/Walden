import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const questionData = [
  {
    text: '¿Con qué frecuencia consume alguna bebida alcohólica?',
    options: ['Nunca', 'Mensualmente o menos', '2-4 veces al mes', '2-3 veces por semana', '4 o más veces por semana'],
  },
  {
    text: '¿Cuántas bebidas alcohólicas consume normalmente en un día de consumo?',
    options: ['1 o 2', '3 o 4', '5 o 6', '7-9', '10 o más'],
  },
  {
    text: '¿Con qué frecuencia consume 6 o más bebidas en una ocasión?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Con qué frecuencia en el último año no pudo parar de beber una vez que había empezado?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Con qué frecuencia en el último año no pudo hacer lo que se esperaba de usted por haber bebido?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Con qué frecuencia en el último año necesitó una bebida por la mañana para sentirse mejor?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Con qué frecuencia en el último año tuvo remordimientos o sentimientos de culpa después de beber?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Con qué frecuencia en el último año no pudo recordar lo ocurrido la noche anterior por haber bebido?',
    options: ['Nunca', 'Menos de una vez al mes', 'Mensualmente', 'Semanalmente', 'Diariamente o casi diariamente'],
  },
  {
    text: '¿Ha resultado usted o alguien más lesionado por su forma de beber?',
    options: ['No', 'Sí, pero no en el último año', 'Sí, en el último año'],
  },
  {
    text: '¿Algún familiar, amigo, médico o profesional de la salud ha mostrado preocupación por su forma de beber o le ha sugerido que reduzca el consumo?',
    options: ['No', 'Sí, pero no en el último año', 'Sí, en el último año'],
  },
];

const scoreOption = (questionIndex, optionIndex) => {
  if (questionIndex <= 7) return optionIndex; // preguntas 1-8 puntúan 0-4
  return optionIndex === 0 ? 0 : optionIndex === 1 ? 2 : 4; // preguntas 9-10 puntúan 0,2,4
};

const interpretScore = (total) => {
  if (total >= 20) return { label: 'Probable dependencia', color: 'text-red-600' };
  if (total >= 16) return { label: 'Consumo dañino', color: 'text-orange-600' };
  if (total >= 8) return { label: 'Consumo riesgoso', color: 'text-yellow-600' };
  return { label: 'Consumo de bajo riesgo', color: 'text-green-600' };
};

const AUDITForm = () => {
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
    responses: Array(10).fill(null),
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

  const setResponse = (questionIdx, optionIdx) => {
    const updated = [...formData.responses];
    updated[questionIdx] = optionIdx;
    setFormData({ ...formData, responses: updated });
  };

  const totalScore = useMemo(() => {
    return formData.responses.reduce((sum, optionIndex, idx) => {
      if (optionIndex === null || optionIndex === undefined) return sum;
      return sum + scoreOption(idx, optionIndex);
    }, 0);
  }, [formData.responses]);

  const severity = interpretScore(totalScore);
  const allAnswered = formData.responses.every((response) => response !== null && response !== undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    if (!allAnswered) return toast.error('Responda las 10 preguntas');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'AUDIT',
        testDate: formData.testDate,
        responses: formData.responses.map((optionIndex, idx) => ({
          itemNumber: idx + 1,
          question: questionData[idx].text,
          response: questionData[idx].options[optionIndex],
          score: scoreOption(idx, optionIndex),
        })),
        scores: { total: totalScore },
        interpretation: {
          severity: severity.label,
          notes: `AUDIT ${totalScore}/40. ${severity.label}.`,
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

      toast.success('AUDIT guardado en el expediente');
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
        <h1 className="text-3xl font-bold text-headingColor">AUDIT</h1>
        <p className="text-textColor mt-1">Alcohol Use Disorders Identification Test (OMS)</p>
        <p className="text-sm text-gray-500 mt-2">
          Evalúa consumo riesgoso, dañino o posible dependencia. Interpretar junto con entrevista clínica.
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
            <strong>Consentimiento:</strong> Este instrumento detecta uso riesgoso de alcohol. Los resultados serán discutidos con su profesional tratante.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questionData.map((question, idx) => (
            <div key={question.text} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {idx + 1}. {question.text}
              </label>
              <div className="space-y-2">
                {question.options.map((option, optionIdx) => (
                  <label
                    key={option}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.responses[idx] === optionIdx
                        ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={optionIdx}
                      checked={formData.responses[idx] === optionIdx}
                      onChange={() => setResponse(idx, optionIdx)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm">Puntaje total</p>
            <p className="text-2xl font-bold">{totalScore} / 40</p>
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
          {submitting ? 'Guardando...' : 'Guardar AUDIT'}
        </button>
      </form>
    </div>
  );
};

export default AUDITForm;
