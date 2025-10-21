// Frontend/src/Dashboard/psychology/assessments/BDIIIForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { toast } from 'react-toastify';

const BDIIIForm = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    responses: Array(21).fill(0),
  });

  const questions = [
    {
      title: 'Tristeza',
      options: [
        'No me siento triste',
        'Me siento triste gran parte del tiempo',
        'Estoy triste todo el tiempo',
        'Estoy tan triste o soy tan infeliz que no puedo soportarlo'
      ]
    },
    {
      title: 'Pesimismo',
      options: [
        'No estoy desalentado(a) respecto de mi futuro',
        'Me siento más desalentado(a) respecto de mi futuro de lo que solía estarlo',
        'No espero que las cosas funcionen para mí',
        'Siento que no hay esperanza para mi futuro y que solo puede empeorar'
      ]
    },
    {
      title: 'Fracaso',
      options: [
        'No me siento como un fracasado(a)',
        'He fracasado más de lo que hubiera debido',
        'Cuando miro hacia atrás veo muchos fracasos',
        'Siento que como persona soy un fracaso total'
      ]
    },
    {
      title: 'Pérdida de Placer',
      options: [
        'Obtengo tanto placer como siempre de las cosas de las que disfruto',
        'No disfruto tanto de las cosas como solía hacerlo',
        'Obtengo muy poco placer de las cosas que solía disfrutar',
        'No puedo obtener ningún placer de las cosas de las que solía disfrutar'
      ]
    },
    {
      title: 'Sentimientos de Culpa',
      options: [
        'No me siento particularmente culpable',
        'Me siento culpable respecto de varias cosas que he hecho o que debería haber hecho',
        'Me siento bastante culpable la mayor parte del tiempo',
        'Me siento culpable todo el tiempo'
      ]
    },
    {
      title: 'Sentimientos de Castigo',
      options: [
        'No siento que estoy siendo castigado(a)',
        'Siento que tal vez pueda ser castigado(a)',
        'Espero ser castigado(a)',
        'Siento que estoy siendo castigado(a)'
      ]
    },
    {
      title: 'Disconformidad con uno mismo',
      options: [
        'Siento acerca de mí lo mismo que siempre',
        'He perdido la confianza en mí mismo(a)',
        'Estoy decepcionado(a) conmigo mismo(a)',
        'No me gusto a mí mismo(a)'
      ]
    },
    {
      title: 'Autocrítica',
      options: [
        'No me critico ni me culpo más de lo habitual',
        'Estoy más crítico(a) conmigo mismo(a) de lo que solía estarlo',
        'Me critico a mí mismo(a) por todos mis errores',
        'Me culpo a mí mismo(a) por todo lo malo que sucede'
      ]
    },
    {
      title: 'Pensamientos o Deseos Suicidas',
      options: [
        'No tengo ningún pensamiento de matarme',
        'He tenido pensamientos de matarme, pero no lo haría',
        'Querría matarme',
        'Me mataría si tuviera la oportunidad de hacerlo'
      ]
    },
    {
      title: 'Llanto',
      options: [
        'No lloro más de lo que solía hacerlo',
        'Lloro más de lo que solía hacerlo',
        'Lloro por cualquier pequeñez',
        'Siento ganas de llorar pero no puedo'
      ]
    },
    {
      title: 'Agitación',
      options: [
        'No estoy más inquieto(a) o tenso(a) que lo habitual',
        'Me siento más inquieto(a) o tenso(a) que lo habitual',
        'Estoy tan inquieto(a) o agitado(a) que me es difícil quedarme quieto(a)',
        'Estoy tan inquieto(a) o agitado(a) que tengo que estar siempre en movimiento o haciendo algo'
      ]
    },
    {
      title: 'Pérdida de Interés',
      options: [
        'No he perdido el interés en otras actividades o personas',
        'Estoy menos interesado(a) que antes en otras personas o cosas',
        'He perdido casi todo el interés en otras personas o cosas',
        'Me es difícil interesarme por algo'
      ]
    },
    {
      title: 'Indecisión',
      options: [
        'Tomo mis decisiones tan bien como siempre',
        'Me resulta más difícil que de costumbre tomar decisiones',
        'Encuentro mucha más dificultad que antes para tomar decisiones',
        'Tengo problemas para tomar cualquier decisión'
      ]
    },
    {
      title: 'Desvalorización',
      options: [
        'No siento que yo no sea valioso(a)',
        'No me considero a mí mismo(a) tan valioso(a) y útil como solía considerarme',
        'Me siento menos valioso(a) cuando me comparo con otros',
        'Siento que no valgo nada'
      ]
    },
    {
      title: 'Pérdida de Energía',
      options: [
        'Tengo tanta energía como siempre',
        'Tengo menos energía que la que solía tener',
        'No tengo suficiente energía para hacer demasiado',
        'No tengo energía suficiente para hacer nada'
      ]
    },
    {
      title: 'Cambios en los Hábitos de Sueño',
      options: [
        'No he experimentado ningún cambio en mis hábitos de sueño',
        'Duermo un poco más/menos que lo habitual',
        'Duermo mucho más/menos que lo habitual',
        'Duermo la mayor parte del día / Me despierto 1-2 horas más temprano y no puedo volver a dormirme'
      ]
    },
    {
      title: 'Irritabilidad',
      options: [
        'No estoy más irritable que lo habitual',
        'Estoy más irritable que lo habitual',
        'Estoy mucho más irritable que lo habitual',
        'Estoy irritable todo el tiempo'
      ]
    },
    {
      title: 'Cambios en el Apetito',
      options: [
        'No he experimentado ningún cambio en mi apetito',
        'Mi apetito es un poco menor/mayor que lo habitual',
        'Mi apetito es mucho menor/mayor que antes',
        'No tengo apetito en absoluto / Quiero comer todo el tiempo'
      ]
    },
    {
      title: 'Dificultad de Concentración',
      options: [
        'Puedo concentrarme tan bien como siempre',
        'No puedo concentrarme tan bien como habitualmente',
        'Me es difícil mantener la mente en algo por mucho tiempo',
        'Encuentro que no puedo concentrarme en nada'
      ]
    },
    {
      title: 'Cansancio o Fatiga',
      options: [
        'No estoy más cansado(a) o fatigado(a) que lo habitual',
        'Me fatigo o me canso más fácilmente que lo habitual',
        'Estoy demasiado fatigado(a) o cansado(a) para hacer muchas de las cosas que solía hacer',
        'Estoy demasiado fatigado(a) o cansado(a) para hacer la mayoría de las cosas que solía hacer'
      ]
    },
    {
      title: 'Pérdida de Interés en el Sexo',
      options: [
        'No he notado ningún cambio reciente en mi interés por el sexo',
        'Estoy menos interesado(a) en el sexo de lo que solía estarlo',
        'Estoy mucho menos interesado(a) en el sexo ahora',
        'He perdido completamente el interés en el sexo'
      ]
    }
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
      const response = await fetch(`${BASE_URL}/psychology/patients`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
    if (total >= 29) return { label: 'Severa', color: 'text-red-600' };
    if (total >= 20) return { label: 'Moderada', color: 'text-orange-600' };
    if (total >= 14) return { label: 'Leve', color: 'text-yellow-600' };
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
        testType: 'BDI-II',
        testDate: formData.testDate,
        responses: formData.responses.map((score, index) => ({
          itemNumber: index + 1,
          question: questions[index].title,
          response: score,
          responseText: questions[index].options[score],
        })),
        scores: {
          total: totalScore,
        },
        interpretation: {
          severity: severity.label.toLowerCase(),
          notes: `BDI-II Score: ${totalScore}/63. ${severity.label} depression.`,
        },
      };

      const response = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success('Evaluación BDI-II guardada exitosamente');
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
        <h1 className="text-3xl font-bold text-headingColor">BDI-II</h1>
        <p className="text-textColor mt-1">Beck Depression Inventory - Inventario de Depresión de Beck</p>
        <p className="text-sm text-gray-500 mt-2">
          Cuestionario de 21 ítems para evaluar la severidad de síntomas depresivos durante las últimas 2 semanas, incluyendo hoy.
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
            <strong>Instrucciones:</strong> Este cuestionario consta de 21 grupos de afirmaciones. Por favor, lea con atención cada uno de ellos y elija la opción que mejor describa cómo se ha sentido durante las últimas dos semanas, incluyendo el día de hoy.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={index} className={`p-4 rounded-lg ${index === 8 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                {index + 1}. {question.title}
                {index === 8 && <span className="ml-2 text-red-600 text-xs">(ÍTEM CRÍTICO)</span>}
              </label>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.responses[index] === optionIndex
                        ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={formData.responses[index] === optionIndex}
                      onChange={(e) => handleResponseChange(index, e.target.value)}
                      className="mr-3 mt-1 flex-shrink-0"
                      required
                    />
                    <span className="text-sm">{option}</span>
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
            <p className="text-5xl font-bold text-primaryColor mb-2">{totalScore}<span className="text-2xl text-gray-500">/63</span></p>
            <p className={`text-lg font-semibold ${severity.color}`}>
              Depresión {severity.label}
            </p>
            <div className="mt-4 text-xs text-gray-600">
              <p>0-13: Mínima | 14-19: Leve | 20-28: Moderada | 29-63: Severa</p>
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

export default BDIIIForm;
