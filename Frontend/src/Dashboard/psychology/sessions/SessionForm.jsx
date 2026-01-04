// Frontend/src/Dashboard/psychology/sessions/SessionForm.jsx
import { useState, useEffect } from 'react';
import { useAuthToken } from '../../../hooks/useAuthToken';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import ErrorMessage from '../../../components/Error/Error';
import { toast } from 'react-toastify';

const SessionForm = () => {
  const token = useAuthToken();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: patientId || '',
    sessionNumber: 1,
    sessionDate: new Date().toISOString().slice(0, 16),
    duration: 50,
    modality: 'in-person',
    cbtStructure: {
      moodCheck: false,
      agendaSetting: '',
      homeworkReview: '',
      agendaDiscussion: false,
      newHomework: false,
      feedback: ''
    },
    soapNotes: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    },
    automaticThoughts: [],
    behavioralAssignments: [],
    sessionRatings: {
      anxietyLevel: 5,
      moodLevel: 5,
    },
    criticalSession: false,
    crisisNotes: '',
  });

  const cognitiveDistortions = [
    'Catastrofización',
    'Lectura de mente',
    'Pensamiento todo o nada',
    'Sobregeneralización',
    'Filtro mental',
    'Descalificar lo positivo',
    'Razonamiento emocional',
    'Declaraciones debería',
    'Etiquetado',
    'Personalización',
    'Adivinación del futuro',
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${BASE_URL}/psychology/patients`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleSoapChange = (field, value) => {
    setFormData({
      ...formData,
      soapNotes: { ...formData.soapNotes, [field]: value },
    });
  };

  const handleRatingChange = (field, value) => {
    setFormData({
      ...formData,
      sessionRatings: { ...formData.sessionRatings, [field]: parseInt(value) },
    });
  };

  const addAutomaticThought = () => {
    setFormData({
      ...formData,
      automaticThoughts: [
        ...formData.automaticThoughts,
        {
          situation: '',
          automaticThought: '',
          emotion: '',
          intensity: 5,
          cognitiveDistortion: '',
          rationalResponse: '',
          outcomeIntensity: 5,
        },
      ],
    });
  };

  const updateAutomaticThought = (index, field, value) => {
    const newThoughts = [...formData.automaticThoughts];
    newThoughts[index][field] = field.includes('Intensity') ? parseInt(value) : value;
    setFormData({ ...formData, automaticThoughts: newThoughts });
  };

  const removeAutomaticThought = (index) => {
    const newThoughts = formData.automaticThoughts.filter((_, i) => i !== index);
    setFormData({ ...formData, automaticThoughts: newThoughts });
  };

  const addBehavioralAssignment = () => {
    setFormData({
      ...formData,
      behavioralAssignments: [
        ...formData.behavioralAssignments,
        { task: '', completed: false },
      ],
    });
  };

  const updateBehavioralAssignment = (index, field, value) => {
    const newAssignments = [...formData.behavioralAssignments];
    newAssignments[index][field] = value;
    setFormData({ ...formData, behavioralAssignments: newAssignments });
  };

  const removeBehavioralAssignment = (index) => {
    const newAssignments = formData.behavioralAssignments.filter((_, i) => i !== index);
    setFormData({ ...formData, behavioralAssignments: newAssignments });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient) {
      toast.error('Por favor seleccione un paciente');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/psychology/sessions`, {
            Authorization: `Bearer ${token}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success('Sesión guardada exitosamente');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Nueva Sesión de Terapia</h1>
        <p className="text-textColor mt-1">Registro de sesión con formato SOAP y seguimiento cognitivo-conductual</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-headingColor mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Sesión *</label>
              <input
                type="number"
                min="1"
                value={formData.sessionNumber}
                onChange={(e) => setFormData({ ...formData, sessionNumber: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora *</label>
              <input
                type="datetime-local"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos) *</label>
              <input
                type="number"
                min="15"
                max="180"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad *</label>
              <div className="flex gap-4">
                {['in-person', 'online', 'phone'].map((mode) => (
                  <label key={mode} className="flex items-center">
                    <input
                      type="radio"
                      value={mode}
                      checked={formData.modality === mode}
                      onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {mode === 'in-person' ? 'Presencial' : mode === 'online' ? 'Online' : 'Teléfono'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Estructura TCC */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-primaryColor mb-4">Estructura de Sesión TCC</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.cbtStructure?.moodCheck}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, moodCheck: e.target.checked}})}
                  className="w-5 h-5 text-primaryColor"
                />
                <span className="font-medium">1. Revisión del Estado de Ánimo</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">2. Agenda de la Sesión</label>
                <input
                  type="text"
                  value={formData.cbtStructure?.agendaSetting || ''}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, agendaSetting: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Temas a tratar hoy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3. Revisión de Tareas (Puente)</label>
                <textarea
                  value={formData.cbtStructure?.homeworkReview || ''}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, homeworkReview: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  placeholder="¿Qué se hizo? ¿Qué se aprendió?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.cbtStructure?.agendaDiscussion}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, agendaDiscussion: e.target.checked}})}
                  className="w-5 h-5 text-primaryColor"
                />
                <span className="font-medium">4. Discusión de Temas (Intervención)</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.cbtStructure?.newHomework}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, newHomework: e.target.checked}})}
                  className="w-5 h-5 text-primaryColor"
                />
                <span className="font-medium">5. Asignación de Nuevas Tareas</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6. Resumen y Feedback</label>
                <textarea
                  value={formData.cbtStructure?.feedback || ''}
                  onChange={(e) => setFormData({...formData, cbtStructure: {...formData.cbtStructure, feedback: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  placeholder="¿Qué se lleva el paciente hoy?"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SOAP Notes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-headingColor mb-4">Notas SOAP</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjetivo (S) - Lo que el paciente reporta *
              </label>
              <textarea
                value={formData.soapNotes.subjective}
                onChange={(e) => handleSoapChange('subjective', e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                placeholder="¿Cómo se ha sentido? ¿Qué ha estado experimentando?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo (O) - Observaciones del terapeuta *
              </label>
              <textarea
                value={formData.soapNotes.objective}
                onChange={(e) => handleSoapChange('objective', e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                placeholder="Comportamiento, apariencia, lenguaje corporal observado..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluación (A) - Análisis clínico *
              </label>
              <textarea
                value={formData.soapNotes.assessment}
                onChange={(e) => handleSoapChange('assessment', e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                placeholder="Interpretación, diagnóstico diferencial, progreso hacia objetivos..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan (P) - Intervenciones y próximos pasos *
              </label>
              <textarea
                value={formData.soapNotes.plan}
                onChange={(e) => handleSoapChange('plan', e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                placeholder="Técnicas aplicadas, tareas asignadas, plan para próxima sesión..."
                required
              />
            </div>
          </div>
        </div>

        {/* Automatic Thoughts (CBT) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-headingColor">Registro de Pensamientos Automáticos (TCC)</h2>
            <button
              type="button"
              onClick={addAutomaticThought}
              className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Pensamiento
            </button>
          </div>

          {formData.automaticThoughts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No se han registrado pensamientos automáticos</p>
          ) : (
            <div className="space-y-6">
              {formData.automaticThoughts.map((thought, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Pensamiento #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeAutomaticThought(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Situación</label>
                      <input
                        type="text"
                        value={thought.situation}
                        onChange={(e) => updateAutomaticThought(index, 'situation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                        placeholder="¿Qué estaba pasando?"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pensamiento Automático</label>
                      <textarea
                        value={thought.automaticThought}
                        onChange={(e) => updateAutomaticThought(index, 'automaticThought', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                        placeholder="¿Qué pensamiento pasó por su mente?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emoción</label>
                      <input
                        type="text"
                        value={thought.emotion}
                        onChange={(e) => updateAutomaticThought(index, 'emotion', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                        placeholder="Ej: Tristeza, ansiedad..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intensidad Inicial: {thought.intensity}/10
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={thought.intensity}
                        onChange={(e) => updateAutomaticThought(index, 'intensity', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distorsión Cognitiva</label>
                      <select
                        value={thought.cognitiveDistortion}
                        onChange={(e) => updateAutomaticThought(index, 'cognitiveDistortion', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                      >
                        <option value="">Seleccione una distorsión...</option>
                        {cognitiveDistortions.map((distortion) => (
                          <option key={distortion} value={distortion}>
                            {distortion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Respuesta Racional</label>
                      <textarea
                        value={thought.rationalResponse}
                        onChange={(e) => updateAutomaticThought(index, 'rationalResponse', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                        placeholder="¿Cuál sería una forma más balanceada de pensar?"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intensidad Final: {thought.outcomeIntensity}/10
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={thought.outcomeIntensity}
                        onChange={(e) => updateAutomaticThought(index, 'outcomeIntensity', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Behavioral Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-headingColor">Tareas Conductuales</h2>
            <button
              type="button"
              onClick={addBehavioralAssignment}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Tarea
            </button>
          </div>

          {formData.behavioralAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No se han asignado tareas conductuales</p>
          ) : (
            <div className="space-y-3">
              {formData.behavioralAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={assignment.completed}
                    onChange={(e) => updateBehavioralAssignment(index, 'completed', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <input
                    type="text"
                    value={assignment.task}
                    onChange={(e) => updateBehavioralAssignment(index, 'task', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
                    placeholder="Descripción de la tarea..."
                  />
                  <button
                    type="button"
                    onClick={() => removeBehavioralAssignment(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Ratings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-headingColor mb-4">Valoración de la Sesión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Ansiedad: {formData.sessionRatings.anxietyLevel}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.sessionRatings.anxietyLevel}
                onChange={(e) => handleRatingChange('anxietyLevel', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ninguna</span>
                <span>Extrema</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Ánimo: {formData.sessionRatings.moodLevel}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.sessionRatings.moodLevel}
                onChange={(e) => handleRatingChange('moodLevel', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Muy bajo</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Session */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.criticalSession}
              onChange={(e) => setFormData({ ...formData, criticalSession: e.target.checked })}
              className="w-5 h-5 mt-1"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marcar como Sesión Crítica (Crisis/Riesgo)
              </label>
              {formData.criticalSession && (
                <textarea
                  value={formData.crisisNotes}
                  onChange={(e) => setFormData({ ...formData, crisisNotes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
                  placeholder="Describe la situación de crisis y acciones tomadas..."
                />
              )}
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
            {submitting ? 'Guardando...' : 'Guardar Sesión'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;
