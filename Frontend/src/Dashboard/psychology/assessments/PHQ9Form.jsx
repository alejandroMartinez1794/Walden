// Frontend/src/Dashboard/psychology/assessments/PHQ9Form.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { toast } from 'react-toastify';
import { useAuthToken } from '../../../hooks/useAuthToken';

const PHQ9Form = () => {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    responses: Array(9).fill(0),
  });

  const questions = [
    'Poco interés o placer en hacer cosas',
    'Se ha sentido decaído(a), deprimido(a) o sin esperanzas',
    'Ha tenido dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado',
    'Se ha sentido cansado(a) o con poca energía',
    'Sin apetito o ha comido en exceso',
    'Se ha sentido mal con usted mismo(a) – o que es un fracaso o que ha quedado mal con usted mismo(a) o con su familia',
    'Ha tenido dificultad para concentrarse en cosas, tales como leer el periódico o ver la televisión',
    'Se ha movido o hablado tan lento que otras personas podrían haberlo notado – o lo contrario, muy inquieto(a) o agitado(a) que ha estado moviéndose mucho más de lo normal',
    'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera',
  ];

  const options = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Varios días' },
    { value: 2, label: 'Más de la mitad de los días' },
    { value: 3, label: 'Casi todos los días' },
  ];

  useEffect(() => {
    fetchPatients();
    const preselected = search.get('patient');
    if (preselected) {
      setFormData((d) => ({ ...d, patient: preselected }));
    }
  }, []);

  const fetchPatients = async () => {
    try {
      const authToken = token;
      const response = await fetch(`${BASE_URL}/psychology/patients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPatients(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (index, value) => {
    const newResponses = [...formData.responses];
    newResponses[index] = parseInt(value);
    setFormData({ ...formData, responses: newResponses });
  };

  const calculateScore = () => {
    return formData.responses.reduce((sum, score) => sum + score, 0);
  };

  const getSeverity = (total) => {
    if (total >= 20) return { label: 'Severa', color: 'text-red-600' };
    if (total >= 15) return { label: 'Moderadamente severa', color: 'text-orange-600' };
    if (total >= 10) return { label: 'Moderada', color: 'text-yellow-600' };
    if (total >= 5) return { label: 'Leve', color: 'text-yellow-500' };
    return { label: 'Mínima', color: 'text-green-600' };
  };

  const hasSuicidalIdeation = () => {
    return formData.responses[8] > 0; // Item 9: suicidal thoughts
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient) {
      toast.error('Por favor seleccione un paciente');
      return;
    }

    const totalScore = calculateScore();
    const severity = getSeverity(totalScore);

    // Show warning for suicidal ideation
    if (hasSuicidalIdeation()) {
      if (!window.confirm('⚠️ ALERTA: El paciente ha reportado ideación suicida. Este caso requiere evaluación inmediata de riesgo. ¿Desea continuar guardando esta evaluación?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'PHQ-9',
        testDate: formData.testDate,
        responses: formData.responses.map((score, index) => ({
          itemNumber: index + 1,
          question: questions[index],
          response: score,
        })),
        scores: {
          total: totalScore,
        },
        interpretation: {
          severity: severity.label.toLowerCase().replace(/\s/g, '-'),
          notes: `PHQ-9 Score: ${totalScore}/27. ${severity.label} depression.`,
        },
      };

      const response = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Also store as a clinical measure to trigger alerts and risk banners
      try {
        await fetch(`${BASE_URL}/clinical/patients/${formData.patient}/measures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: 'PHQ-9', responses: formData.responses }),
        });
      } catch (e) {
        // Non-blocking: continue if clinical measure fails
        console.warn('Failed to create clinical measure:', e);
      }

      toast.success('Evaluación PHQ-9 guardada exitosamente');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const totalScore = calculateScore();
  const severity = getSeverity(totalScore);
  const showSuicidalAlert = hasSuicidalIdeation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">PHQ-9</h1>
        <p className="text-textColor mt-1">Patient Health Questionnaire - Cuestionario de Salud del Paciente</p>
        <p className="text-sm text-gray-500 mt-2">
          Cuestionario de 9 ítems para evaluar la severidad de síntomas depresivos durante las últimas 2 semanas.
        </p>
      </div>

      {/* Suicidal Ideation Alert */}
      {showSuicidalAlert && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">⚠️ ALERTA DE RIESGO SUICIDA</h3>
              <p className="text-red-700 text-sm mt-1">
                El paciente ha reportado ideación suicida. Se requiere evaluación inmediata de riesgo y protocolo de crisis.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Patient Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paciente *
          </label>
          <select
            value={formData.patient}
            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            required
          >
            <option value="">Seleccione un paciente</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.personalInfo?.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Test Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Evaluación *
          </label>
          <input
            type="date"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            required
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Instrucciones:</strong> Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={index} className={`p-4 rounded-lg ${index === 8 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {index + 1}. {question}
                {index === 8 && <span className="ml-2 text-red-600 text-xs">(ÍTEM CRÍTICO)</span>}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      onChange={(e) => handleResponseChange(index, e.target.value)}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Puntaje Total</p>
            <p className="text-5xl font-bold text-primaryColor mb-2">{totalScore}<span className="text-2xl text-gray-500">/27</span></p>
            <p className={`text-lg font-semibold ${severity.color}`}>
              Depresión {severity.label}
            </p>
            <div className="mt-4 text-xs text-gray-600">
              <p>0-4: Mínima | 5-9: Leve | 10-14: Moderada | 15-19: Moderadamente severa | 20-27: Severa</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PHQ9Form;
