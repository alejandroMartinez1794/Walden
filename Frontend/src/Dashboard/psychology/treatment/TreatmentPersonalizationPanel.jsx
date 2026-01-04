import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthToken } from '../../../hooks/useAuthToken';
import { BASE_URL } from '../../../config';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loader/Loading';

const TreatmentPersonalizationPanel = ({ patientId }) => {
  const token = useAuthToken();
  const [loading, setLoading] = useState(true);
  const [clinicalHistory, setClinicalHistory] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [plan, setPlan] = useState({
    goals: [],
    interventionTechniques: [],
    sessionFrequency: 'weekly',
    estimatedDuration: '',
    targetDiagnoses: []
  });
  const [isEditing, setIsEditing] = useState(false);

  // Catalogos
  const techniquesCatalog = [
    { id: 'cognitive-restructuring', label: 'Reestructuración Cognitiva', desc: 'Identificar y cuestionar pensamientos distorsionados.' },
    { id: 'behavioral-activation', label: 'Activación Conductual', desc: 'Programación de actividades placenteras y de dominio.' },
    { id: 'exposure-therapy', label: 'Exposición', desc: 'Aproximación gradual a estímulos temidos.' },
    { id: 'relaxation-training', label: 'Entrenamiento en Relajación', desc: 'Respiración diafragmática, relajación muscular progresiva.' },
    { id: 'mindfulness', label: 'Mindfulness', desc: 'Atención plena al momento presente.' },
    { id: 'problem-solving', label: 'Resolución de Problemas', desc: 'Enfoque estructurado para abordar dificultades vitales.' },
    { id: 'social-skills-training', label: 'Habilidades Sociales', desc: 'Entrenamiento en asertividad y comunicación.' },
    { id: 'thought-stopping', label: 'Detención del Pensamiento', desc: 'Interrupción de rumiación.' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Historia Clínica
        const historyRes = await fetch(`${BASE_URL}/psychology/patients/${patientId}/clinical-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        if (historyData.success) setClinicalHistory(historyData.data);

        // 2. Evaluaciones
        const assessmentsRes = await fetch(`${BASE_URL}/psychology/patients/${patientId}/assessments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const assessmentsData = await assessmentsRes.json();
        if (assessmentsData.success) setAssessments(assessmentsData.data);

        // 3. Plan de Tratamiento
        const planRes = await fetch(`${BASE_URL}/psychology/patients/${patientId}/treatment-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planRes.json();
        if (planData.success && planData.data.length > 0) {
          setPlan(planData.data[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar datos del tratamiento');
      } finally {
        setLoading(false);
      }
    };

    if (patientId && token) fetchData();
  }, [patientId, token]);

  const handleSavePlan = async () => {
    try {
      const method = plan._id ? 'PUT' : 'POST';
      const url = plan._id 
        ? `${BASE_URL}/psychology/treatment-plans/${plan._id}`
        : `${BASE_URL}/psychology/treatment-plans`;
      
      const body = { ...plan, patient: patientId };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setPlan(data.data);
      setIsEditing(false);
      toast.success('Plan de tratamiento actualizado');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addGoal = () => {
    setPlan(prev => ({
      ...prev,
      goals: [...prev.goals, { description: '', status: 'not-started', specific: '', measurable: '' }]
    }));
  };

  const updateGoal = (index, field, value) => {
    const newGoals = [...plan.goals];
    newGoals[index][field] = value;
    setPlan(prev => ({ ...prev, goals: newGoals }));
  };

  const removeGoal = (index) => {
    setPlan(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const toggleTechnique = (techId) => {
    const exists = plan.interventionTechniques.find(t => t.technique === techId);
    if (exists) {
      setPlan(prev => ({
        ...prev,
        interventionTechniques: prev.interventionTechniques.filter(t => t.technique !== techId)
      }));
    } else {
      setPlan(prev => ({
        ...prev,
        interventionTechniques: [...prev.interventionTechniques, { technique: techId, description: '' }]
      }));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Header Contextual */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-headingColor mb-4">Panel de Personalización del Tratamiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Diagnóstico (Historia Clínica)</h3>
            <p className="text-sm text-blue-900">
              {clinicalHistory?.diagnosis?.primary || 'No especificado'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {clinicalHistory?.diagnosis?.secondary && `Secundario: ${clinicalHistory.diagnosis.secondary}`}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-2">Evaluaciones Recientes</h3>
            <div className="space-y-1">
              {assessments.slice(0, 3).map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-purple-900">{a.type}</span>
                  <span className="font-bold text-purple-700">{a.score}</span>
                </div>
              ))}
              {assessments.length === 0 && <p className="text-sm text-purple-600">Sin evaluaciones registradas</p>}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">Resumen del Plan</h3>
            <p className="text-sm text-green-900">Metas Activas: {plan.goals.filter(g => g.status === 'in-progress').length}</p>
            <p className="text-sm text-green-900">Técnicas: {plan.interventionTechniques.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Configuración del Plan */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Establecimiento de Metas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-headingColor">🎯 Objetivos Terapéuticos (SMART)</h3>
              <button onClick={() => setIsEditing(!isEditing)} className="text-primaryColor hover:underline">
                {isEditing ? 'Cancelar Edición' : 'Editar Plan'}
              </button>
            </div>
            
            <div className="space-y-4">
              {plan.goals.map((goal, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => updateGoal(index, 'description', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Descripción del objetivo"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={goal.specific}
                          onChange={(e) => updateGoal(index, 'specific', e.target.value)}
                          className="p-2 border rounded text-sm"
                          placeholder="Específico (Qué)"
                        />
                        <input
                          type="text"
                          value={goal.measurable}
                          onChange={(e) => updateGoal(index, 'measurable', e.target.value)}
                          className="p-2 border rounded text-sm"
                          placeholder="Medible (Cómo)"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <select
                          value={goal.status}
                          onChange={(e) => updateGoal(index, 'status', e.target.value)}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="not-started">No iniciado</option>
                          <option value="in-progress">En progreso</option>
                          <option value="achieved">Logrado</option>
                        </select>
                        <button onClick={() => removeGoal(index)} className="text-red-500 text-sm">Eliminar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800">{goal.description || 'Sin descripción'}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                          goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status === 'achieved' ? 'Logrado' : goal.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>
                      {(goal.specific || goal.measurable) && (
                        <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-2">
                          {goal.specific && <p><strong>S:</strong> {goal.specific}</p>}
                          {goal.measurable && <p><strong>M:</strong> {goal.measurable}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={addGoal} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50">
                  + Añadir Objetivo
                </button>
              )}
            </div>
          </div>

          {/* 2. Selección de Técnicas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-headingColor mb-4">🛠️ Selección de Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {techniquesCatalog.map((tech) => {
                const isSelected = plan.interventionTechniques.some(t => t.technique === tech.id);
                return (
                  <div 
                    key={tech.id}
                    onClick={() => isEditing && toggleTechnique(tech.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    } ${!isEditing && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{tech.label}</h4>
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{tech.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Columna Derecha: Estructura y Planificación */}
        <div className="space-y-8">
          
          {/* 3. Estructura del Plan */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-headingColor mb-4">📅 Estructura</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                {isEditing ? (
                  <select 
                    value={plan.sessionFrequency}
                    onChange={(e) => setPlan({...plan, sessionFrequency: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                ) : (
                  <p className="text-gray-800 font-medium">
                    {plan.sessionFrequency === 'weekly' ? 'Semanal' : 
                     plan.sessionFrequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={plan.estimatedDuration}
                    onChange={(e) => setPlan({...plan, estimatedDuration: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Ej: 12 sesiones"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{plan.estimatedDuration || 'No definida'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Planificación de Sesiones (Roadmap) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-headingColor mb-4">🗺️ Roadmap de Sesiones</h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="ml-6 relative">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                    <span className="text-xs font-bold text-blue-600">{num}</span>
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">Sesión {num}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {num === 1 ? 'Evaluación y Psicoeducación' : 
                     num === 2 ? 'Identificación de Pensamientos' :
                     num === 3 ? 'Reestructuración Cognitiva' : 'Exposición / Experimentos'}
                  </p>
                </div>
              ))}
              <div className="ml-6">
                <p className="text-xs text-gray-400 italic">Planificación sugerida basada en TCC estándar</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSavePlan}
              className="w-full py-3 bg-primaryColor text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all"
            >
              Guardar Plan de Tratamiento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentPersonalizationPanel;
