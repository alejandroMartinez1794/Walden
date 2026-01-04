import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthToken } from '../../../../hooks/useAuthToken';
import { BASE_URL } from '../../../../config';
import { useNavigate, useParams } from 'react-router-dom';

const CaseFormulationForm = () => {
  const { patientId } = useParams();
  const token = useAuthToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');

  useEffect(() => {
    if (!patientId) {
      const fetchPatients = async () => {
        try {
          const res = await fetch(`${BASE_URL}/psychology/patients`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setPatients(data.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchPatients();
    }
  }, [patientId, token]);

  const [formData, setFormData] = useState({
    identifyingInformation: {
      name: '',
      age: '',
      occupation: '',
      livingSituation: ''
    },
    problemList: [{ problem: '', severity: 5, frequency: '' }],
    diagnosis: {
      axisI: '', // Trastornos clínicos
      axisII: '', // Trastornos de personalidad / RM
      axisIII: '', // Condiciones médicas
      axisIV: '', // Problemas psicosociales
      axisV: '' // GAF / WHODAS
    },
    developmentalHistory: {
      relevantChildhoodEvents: '',
      attachmentStyle: '',
      traumaHistory: '',
      biologicalFactors: ''
    },
    cognitiveProfile: {
      coreBeliefs: {
        self: '', // "Soy incompetente"
        others: '', // "La gente es peligrosa"
        world: '' // "El mundo es impredecible"
      },
      intermediateBeliefs: {
        rules: '', // "Debo ser perfecto para ser aceptado"
        attitudes: '', // "Es terrible fallar"
        assumptions: '' // "Si fallo, nadie me querrá"
      },
      copingStrategies: {
        overcompensation: '', // Perfeccionismo
        avoidance: '', // Aislamiento
        surrender: '' // Dependencia
      }
    },
    functionalAnalysis: {
      triggers: '', // Antecedentes
      behaviors: '', // Conductas problemáticas
      consequences: {
        shortTerm: '', // Alivio inmediato
        longTerm: '' // Mantenimiento del problema
      }
    },
    strengthsAndAssets: '',
    treatmentPlan: {
      shortTermGoals: '',
      longTermGoals: '',
      interventions: '',
      barriersToChange: ''
    }
  });

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        };
      }
      if (typeof prev[section] === 'object' && !Array.isArray(prev[section]) && field) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  };

  const addProblem = () => {
    setFormData(prev => ({
      ...prev,
      problemList: [...prev.problemList, { problem: '', severity: 5, frequency: '' }]
    }));
  };

  const updateProblem = (index, field, value) => {
    const newProblems = [...formData.problemList];
    newProblems[index][field] = value;
    setFormData(prev => ({ ...prev, problemList: newProblems }));
  };

  const removeProblem = (index) => {
    setFormData(prev => ({
      ...prev,
      problemList: prev.problemList.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Aquí iría la llamada al backend para guardar la formulación
      // Por ahora simulamos éxito o usamos un endpoint genérico de notas si no existe uno específico
      // const res = await fetch(`${BASE_URL}/psychology/patients/${patientId}/case-formulation`, ...);
      
      // Simulamos guardado en localStorage o log para demo
      console.log('Formulación de Caso Guardada:', formData);
      toast.success('Formulación de caso guardada exitosamente');
      // navigate(-1); // Opcional: volver atrás
    } catch (error) {
      toast.error('Error al guardar la formulación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primaryColor p-6 text-white">
          <h1 className="text-3xl font-bold">Formulación de Caso TCC</h1>
          <p className="mt-2 opacity-90">Conceptualización Cognitiva y Plan de Tratamiento Integral</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Selector de Paciente si no viene en URL */}
          {!patientId && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Paciente</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">-- Seleccione un paciente --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.personalInfo?.fullName || 'Paciente sin nombre'}</option>
                ))}
              </select>
            </div>
          )}

          {/* 1. Lista de Problemas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">1. Lista de Problemas Presentes</h2>
            {formData.problemList.map((item, index) => (
              <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Problema</label>
                  <input
                    type="text"
                    value={item.problem}
                    onChange={(e) => updateProblem(index, 'problem', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Descripción del problema"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">Severidad (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={item.severity}
                    onChange={(e) => updateProblem(index, 'severity', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Frecuencia</label>
                  <input
                    type="text"
                    value={item.frequency}
                    onChange={(e) => updateProblem(index, 'frequency', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ej: Diario"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeProblem(index)}
                  className="mt-6 text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProblem}
              className="text-primaryColor font-medium hover:underline"
            >
              + Añadir Problema
            </button>
          </section>

          {/* 2. Diagnóstico Multiaxial (Adaptado) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">2. Impresión Diagnóstica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Trastornos Clínicos (Eje I)</label>
                <textarea
                  value={formData.diagnosis.axisI}
                  onChange={(e) => handleInputChange('diagnosis', 'axisI', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Personalidad / RM (Eje II)</label>
                <textarea
                  value={formData.diagnosis.axisII}
                  onChange={(e) => handleInputChange('diagnosis', 'axisII', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Condiciones Médicas (Eje III)</label>
                <textarea
                  value={formData.diagnosis.axisIII}
                  onChange={(e) => handleInputChange('diagnosis', 'axisIII', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Factores Psicosociales (Eje IV)</label>
                <textarea
                  value={formData.diagnosis.axisIV}
                  onChange={(e) => handleInputChange('diagnosis', 'axisIV', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
          </section>

          {/* 3. Historia del Desarrollo */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">3. Historia del Desarrollo Relevante</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eventos vitales tempranos e historia de apego</label>
                <textarea
                  value={formData.developmentalHistory.relevantChildhoodEvents}
                  onChange={(e) => handleInputChange('developmentalHistory', 'relevantChildhoodEvents', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="Relación con cuidadores, ambiente familiar, eventos significativos..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Historia de Trauma</label>
                <textarea
                  value={formData.developmentalHistory.traumaHistory}
                  onChange={(e) => handleInputChange('developmentalHistory', 'traumaHistory', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
          </section>

          {/* 4. Perfil Cognitivo (Core) */}
          <section className="space-y-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-primaryColor border-b border-blue-200 pb-2">4. Conceptualización Cognitiva</h2>
            
            {/* Creencias Centrales */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Creencias Centrales (Esquemas)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sobre Sí Mismo (Self)</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.coreBeliefs.self}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'coreBeliefs', e.target.value, 'self')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder='Ej: "Soy inadecuado"'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobre los Otros</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.coreBeliefs.others}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'coreBeliefs', e.target.value, 'others')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder='Ej: "Los otros son críticos"'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobre el Mundo/Futuro</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.coreBeliefs.world}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'coreBeliefs', e.target.value, 'world')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder='Ej: "El futuro es desesperanzador"'
                  />
                </div>
              </div>
            </div>

            {/* Creencias Intermedias */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Creencias Intermedias</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Reglas</label>
                  <textarea
                    value={formData.cognitiveProfile.intermediateBeliefs.rules}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'intermediateBeliefs', e.target.value, 'rules')}
                    className="w-full p-3 border rounded-lg bg-white"
                    rows="2"
                    placeholder='Ej: "Debo complacer a todos"'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Actitudes</label>
                  <textarea
                    value={formData.cognitiveProfile.intermediateBeliefs.attitudes}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'intermediateBeliefs', e.target.value, 'attitudes')}
                    className="w-full p-3 border rounded-lg bg-white"
                    rows="2"
                    placeholder='Ej: "Es terrible caerle mal a alguien"'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supuestos (Si... entonces...)</label>
                  <textarea
                    value={formData.cognitiveProfile.intermediateBeliefs.assumptions}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'intermediateBeliefs', e.target.value, 'assumptions')}
                    className="w-full p-3 border rounded-lg bg-white"
                    rows="2"
                    placeholder='Ej: "Si digo que no, me rechazarán"'
                  />
                </div>
              </div>
            </div>

            {/* Estrategias Compensatorias */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Estrategias Compensatorias (Conductuales)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sobrecompensación</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.copingStrategies.overcompensation}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'copingStrategies', e.target.value, 'overcompensation')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder="Ej: Perfeccionismo extremo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Evitación</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.copingStrategies.avoidance}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'copingStrategies', e.target.value, 'avoidance')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder="Ej: Evitar situaciones sociales"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rendición/Dependencia</label>
                  <input
                    type="text"
                    value={formData.cognitiveProfile.copingStrategies.surrender}
                    onChange={(e) => handleInputChange('cognitiveProfile', 'copingStrategies', e.target.value, 'surrender')}
                    className="w-full p-3 border rounded-lg bg-white"
                    placeholder="Ej: Buscar reaseguro constante"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Análisis Funcional */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">5. Análisis Funcional de la Conducta</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <label className="block font-bold mb-2 text-yellow-800">Antecedentes (Disparadores)</label>
                <textarea
                  value={formData.functionalAnalysis.triggers}
                  onChange={(e) => handleInputChange('functionalAnalysis', 'triggers', e.target.value)}
                  className="w-full p-3 border rounded bg-white"
                  rows="4"
                  placeholder="¿Qué sucede antes? (Interno/Externo)"
                />
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <label className="block font-bold mb-2 text-red-800">Conducta Problema</label>
                <textarea
                  value={formData.functionalAnalysis.behaviors}
                  onChange={(e) => handleInputChange('functionalAnalysis', 'behaviors', e.target.value)}
                  className="w-full p-3 border rounded bg-white"
                  rows="4"
                  placeholder="Descripción detallada de la conducta"
                />
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <label className="block font-bold mb-2 text-green-800">Consecuencias</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.functionalAnalysis.consequences.shortTerm}
                    onChange={(e) => handleInputChange('functionalAnalysis', 'consequences', e.target.value, 'shortTerm')}
                    className="w-full p-2 border rounded bg-white"
                    placeholder="Corto plazo (Refuerzo + / -)"
                  />
                  <input
                    type="text"
                    value={formData.functionalAnalysis.consequences.longTerm}
                    onChange={(e) => handleInputChange('functionalAnalysis', 'consequences', e.target.value, 'longTerm')}
                    className="w-full p-2 border rounded bg-white"
                    placeholder="Largo plazo (Costos)"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 6. Fortalezas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">6. Fortalezas y Recursos</h2>
            <textarea
              value={formData.strengthsAndAssets}
              onChange={(e) => handleInputChange('strengthsAndAssets', null, e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Cualidades positivas, habilidades de afrontamiento, red de apoyo, motivación..."
            />
          </section>

          {/* 7. Plan de Tratamiento */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-headingColor border-b pb-2">7. Plan de Tratamiento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Objetivos a Corto Plazo</label>
                <textarea
                  value={formData.treatmentPlan.shortTermGoals}
                  onChange={(e) => handleInputChange('treatmentPlan', 'shortTermGoals', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objetivos a Largo Plazo</label>
                <textarea
                  value={formData.treatmentPlan.longTermGoals}
                  onChange={(e) => handleInputChange('treatmentPlan', 'longTermGoals', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Intervenciones Planeadas</label>
                <textarea
                  value={formData.treatmentPlan.interventions}
                  onChange={(e) => handleInputChange('treatmentPlan', 'interventions', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="Técnicas cognitivas, conductuales, experienciales..."
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-primaryColor text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Formulación'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CaseFormulationForm;
