// Frontend/src/Dashboard/psychology/patients/ClinicalHistoryForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loader/Loading';
import ErrorMessage from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const ClinicalHistoryForm = () => {
  const token = useAuthToken();
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [data, setData] = useState({
    intake: { chiefComplaint: '', referralSource: '', date: '', presentingConcerns: '' },
    currentProblemHistory: { onset: '', duration: '', severity: '', frequency: '', triggers: '', maintainingFactors: '', cognitiveContent: '', emotionalResponse: '', behavioralPatterns: '', previousTreatments: '' },
    functionalAnalysis: { antecedents: '', behavior: '', consequencesShortTerm: '', consequencesLongTerm: '' },
    personalHistory: { family: '', childhood: '', education: '', work: '', relationships: '', medical: '', psychiatric: '' },
    familyAndSupport: { supportNetwork: '', familyDynamics: '', significantRelationships: '' },
    substanceUse: { alcohol: '', tobacco: '', drugs: '', details: '' },
    risk: { suicidalIdeation: false, suicidalPlan: '', suicidalIntent: '', selfHarm: false, selfHarmHistory: '', domesticViolence: false, violenceHistory: '', accessToLethalMeans: false, protectiveFactors: '', safetyPlan: '' },
    mentalStatusExam: { appearance: '', behavior: '', speech: '', mood: '', affect: '', thought: '', perception: '', cognition: '', orientation: '', memory: '', concentration: '', insight: '', judgment: '' },
    scales: { phq9: '', phq9Items: Array(9).fill(''), gad7: '', gad7Items: Array(7).fill('') },
    diagnosis: { primary: '', secondary: '', criteria: '', codes: '', differentialDiagnosis: '', severity: '', specifiers: '' },
    goalsAndPlan: { treatmentGoals: '', cbtTechniquesPlanned: '', sessionFrequency: '', estimatedDuration: '', homeworkPlanned: '', progressIndicators: '' },
    consent: { statement: '', informedConsent: false, confidentialityExplained: false, limitationsDiscussed: false },
  });

  const [newPatientData, setNewPatientData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    phone: '',
    email: '',
  });

  useEffect(() => { (async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/psychology/patients/${patientId}/clinical-history`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      if (json.data) setData(json.data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  })(); }, [patientId, token]);

  const onChange = (path, value) => {
    setData((prev) => {
      const clone = { ...prev };
      const keys = path.split('.');
      let node = clone;
      for (let i = 0; i < keys.length - 1; i++) node = node[keys[i]] = node[keys[i]] ?? {};
      node[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      let targetPatientId = patientId;

      // Si no hay ID de paciente, crearlo primero
      if (!targetPatientId) {
        if (!newPatientData.fullName || !newPatientData.dateOfBirth) {
          toast.error('Por favor complete el nombre y fecha de nacimiento del paciente');
          setSaving(false);
          return;
        }

        const patientPayload = {
          personalInfo: {
            ...newPatientData,
            address: '',
            emergencyContact: { name: '', relationship: '', phone: '' }
          },
          clinicalInfo: {
            chiefComplaint: data.intake?.chiefComplaint || '',
            referralSource: data.intake?.referralSource || ''
          }
        };

        const createRes = await fetch(`${BASE_URL}/psychology/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(patientPayload)
        });
        
        const createJson = await createRes.json();
        if (!createRes.ok) throw new Error(createJson.message);
        targetPatientId = createJson.data._id;
      }

      // Guardar historia clínica
      const res = await fetch(`${BASE_URL}/psychology/patients/${targetPatientId}/clinical-history`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      toast.success('Historia clínica guardada exitosamente');
      navigate(`/psychology/patients/${targetPatientId}`);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const tabs = [
    ...(!patientId ? [{ name: 'Datos Paciente', icon: '👤' }] : []),
    { name: 'Ingreso', icon: '📝' },
    { name: 'Problema Actual', icon: '🔍' },
    { name: 'Análisis Funcional', icon: '⚙️' },
    { name: 'Historia Personal', icon: '📖' },
    { name: 'Examen Mental', icon: '🧠' },
    { name: 'Riesgo', icon: '⚠️' },
    { name: 'Escalas', icon: '📊' },
    { name: 'Diagnóstico', icon: '🏥' },
    { name: 'Plan TCC', icon: '🎯' },
    { name: 'Consentimiento', icon: '✍️' },
  ];

  const renderTabContent = () => {
    // Ajustar índice si hay pestaña extra
    const effectiveTab = !patientId ? currentTab - 1 : currentTab;

    if (!patientId && currentTab === 0) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-headingColor mb-4">Datos Básicos del Nuevo Paciente</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <p className="text-sm text-blue-800">
              ℹ️ Estás creando una historia clínica para un paciente nuevo. Al guardar, se creará automáticamente el expediente del paciente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre Completo *</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" 
                value={newPatientData.fullName} 
                onChange={e => setNewPatientData({...newPatientData, fullName: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Nacimiento *</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" 
                value={newPatientData.dateOfBirth} 
                onChange={e => setNewPatientData({...newPatientData, dateOfBirth: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Género</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" 
                value={newPatientData.gender} 
                onChange={e => setNewPatientData({...newPatientData, gender: e.target.value})}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer-not-to-say">Prefiero no decir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <input 
                type="tel" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" 
                value={newPatientData.phone} 
                onChange={e => setNewPatientData({...newPatientData, phone: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email (Opcional - para vincular cuenta)</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" 
                value={newPatientData.email} 
                onChange={e => setNewPatientData({...newPatientData, email: e.target.value})} 
              />
            </div>
          </div>
        </div>
      );
    }

    switch (effectiveTab) {
      case 0: // Ingreso
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Datos de Ingreso y Referencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de evaluación</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.intake?.date || ''} onChange={e=>onChange('intake.date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fuente de referencia</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.intake?.referralSource || ''} onChange={e=>onChange('intake.referralSource', e.target.value)} placeholder="Médico, familia, auto-referencia, etc." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Motivo de consulta (en palabras del paciente)</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.intake?.chiefComplaint || ''} onChange={e=>onChange('intake.chiefComplaint', e.target.value)} placeholder="¿Por qué busca ayuda en este momento?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preocupaciones principales</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.intake?.presentingConcerns || ''} onChange={e=>onChange('intake.presentingConcerns', e.target.value)} placeholder="Síntomas, dificultades, áreas de afectación" />
            </div>
          </div>
        );

      case 1: // Problema Actual
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Historia del Problema Actual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Inicio</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.currentProblemHistory?.onset || ''} onChange={e=>onChange('currentProblemHistory.onset', e.target.value)} placeholder="Ej: hace 6 meses" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duración</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.currentProblemHistory?.duration || ''} onChange={e=>onChange('currentProblemHistory.duration', e.target.value)} placeholder="Ej: continuo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Severidad (1-10)</label>
                <input type="number" min="1" max="10" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.currentProblemHistory?.severity || ''} onChange={e=>onChange('currentProblemHistory.severity', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Frecuencia de los síntomas</label>
              <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.currentProblemHistory?.frequency || ''} onChange={e=>onChange('currentProblemHistory.frequency', e.target.value)} placeholder="Ej: diariamente, varias veces por semana" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Disparadores (situaciones, eventos, pensamientos)</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.currentProblemHistory?.triggers || ''} onChange={e=>onChange('currentProblemHistory.triggers', e.target.value)} placeholder="¿Qué desencadena los síntomas?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Factores de mantenimiento</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.currentProblemHistory?.maintainingFactors || ''} onChange={e=>onChange('currentProblemHistory.maintainingFactors', e.target.value)} placeholder="¿Qué mantiene el problema?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contenido cognitivo (pensamientos automáticos, creencias centrales)</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.currentProblemHistory?.cognitiveContent || ''} onChange={e=>onChange('currentProblemHistory.cognitiveContent', e.target.value)} placeholder="Pensamientos recurrentes, creencias sobre sí mismo/otros/mundo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Respuesta emocional</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.currentProblemHistory?.emotionalResponse || ''} onChange={e=>onChange('currentProblemHistory.emotionalResponse', e.target.value)} placeholder="Emociones predominantes" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Patrones conductuales</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.currentProblemHistory?.behavioralPatterns || ''} onChange={e=>onChange('currentProblemHistory.behavioralPatterns', e.target.value)} placeholder="Conductas de evitación, compulsiones, aislamiento, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tratamientos previos</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.currentProblemHistory?.previousTreatments || ''} onChange={e=>onChange('currentProblemHistory.previousTreatments', e.target.value)} placeholder="Terapias, medicación, resultados" />
            </div>
          </div>
        );

      case 2: // Análisis Funcional
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Análisis Funcional de la Conducta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <label className="block font-bold mb-2 text-yellow-800">Antecedentes (Disparadores)</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.functionalAnalysis?.antecedents || ''} onChange={e=>onChange('functionalAnalysis.antecedents', e.target.value)} placeholder="¿Qué sucede antes? (Interno/Externo)" />
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <label className="block font-bold mb-2 text-red-800">Conducta Problema</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.functionalAnalysis?.behavior || ''} onChange={e=>onChange('functionalAnalysis.behavior', e.target.value)} placeholder="Descripción detallada de la conducta" />
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 md:col-span-2">
                <label className="block font-bold mb-2 text-green-800">Consecuencias</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Corto Plazo</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.functionalAnalysis?.consequencesShortTerm || ''} onChange={e=>onChange('functionalAnalysis.consequencesShortTerm', e.target.value)} placeholder="Alivio inmediato, gratificación..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Largo Plazo</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.functionalAnalysis?.consequencesLongTerm || ''} onChange={e=>onChange('functionalAnalysis.consequencesLongTerm', e.target.value)} placeholder="Costos, mantenimiento del problema..." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Historia Personal
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Historia Personal y Psicosocial</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Historia familiar</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.personalHistory?.family || ''} onChange={e=>onChange('personalHistory.family', e.target.value)} placeholder="Composición familiar, dinámica, antecedentes psiquiátricos" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia de la infancia y desarrollo</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.personalHistory?.childhood || ''} onChange={e=>onChange('personalHistory.childhood', e.target.value)} placeholder="Eventos significativos, traumas, desarrollo temprano" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia educativa</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.personalHistory?.education || ''} onChange={e=>onChange('personalHistory.education', e.target.value)} placeholder="Nivel educativo, dificultades académicas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia laboral</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.personalHistory?.work || ''} onChange={e=>onChange('personalHistory.work', e.target.value)} placeholder="Ocupación actual, historial laboral, satisfacción" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia de relaciones</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.personalHistory?.relationships || ''} onChange={e=>onChange('personalHistory.relationships', e.target.value)} placeholder="Relaciones significativas, estado civil, hijos" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia médica</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.personalHistory?.medical || ''} onChange={e=>onChange('personalHistory.medical', e.target.value)} placeholder="Condiciones médicas, cirugías, medicación actual" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia psiquiátrica</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.personalHistory?.psychiatric || ''} onChange={e=>onChange('personalHistory.psychiatric', e.target.value)} placeholder="Diagnósticos previos, hospitalizaciones, intentos de suicidio" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Uso de sustancias</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.substanceUse?.alcohol || ''} onChange={e=>onChange('substanceUse.alcohol', e.target.value)} placeholder="Alcohol" />
                <input className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.substanceUse?.tobacco || ''} onChange={e=>onChange('substanceUse.tobacco', e.target.value)} placeholder="Tabaco" />
                <input className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.substanceUse?.drugs || ''} onChange={e=>onChange('substanceUse.drugs', e.target.value)} placeholder="Drogas" />
              </div>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.substanceUse?.details || ''} onChange={e=>onChange('substanceUse.details', e.target.value)} placeholder="Detalles sobre frecuencia, cantidad, intentos de dejar" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Red de apoyo</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.familyAndSupport?.supportNetwork || ''} onChange={e=>onChange('familyAndSupport.supportNetwork', e.target.value)} placeholder="Personas de apoyo, recursos comunitarios" />
            </div>
          </div>
        );

      case 4: // Examen Mental
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Examen del Estado Mental</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Apariencia</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.appearance || ''} onChange={e=>onChange('mentalStatusExam.appearance', e.target.value)} placeholder="Vestimenta, higiene, contacto visual" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comportamiento</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.behavior || ''} onChange={e=>onChange('mentalStatusExam.behavior', e.target.value)} placeholder="Actitud, cooperación, psicomotor" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Habla</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.speech || ''} onChange={e=>onChange('mentalStatusExam.speech', e.target.value)} placeholder="Ritmo, volumen, fluidez" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado de ánimo (subjetivo)</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.mood || ''} onChange={e=>onChange('mentalStatusExam.mood', e.target.value)} placeholder="En palabras del paciente" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Afecto (objetivo)</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.affect || ''} onChange={e=>onChange('mentalStatusExam.affect', e.target.value)} placeholder="Rango, apropiado, lábil, plano" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pensamiento (proceso y contenido)</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.thought || ''} onChange={e=>onChange('mentalStatusExam.thought', e.target.value)} placeholder="Organizado, tangencial, ideas delirantes" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Percepción</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.perception || ''} onChange={e=>onChange('mentalStatusExam.perception', e.target.value)} placeholder="Alucinaciones, ilusiones" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cognición</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.cognition || ''} onChange={e=>onChange('mentalStatusExam.cognition', e.target.value)} placeholder="Atención, funciones ejecutivas" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Orientación</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.orientation || ''} onChange={e=>onChange('mentalStatusExam.orientation', e.target.value)} placeholder="Persona, lugar, tiempo, situación" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Memoria</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.memory || ''} onChange={e=>onChange('mentalStatusExam.memory', e.target.value)} placeholder="Inmediata, reciente, remota" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Concentración</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.concentration || ''} onChange={e=>onChange('mentalStatusExam.concentration', e.target.value)} placeholder="Intacta, disminuida" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Insight</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.insight || ''} onChange={e=>onChange('mentalStatusExam.insight', e.target.value)} placeholder="Bueno, parcial, pobre" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Juicio</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.mentalStatusExam?.judgment || ''} onChange={e=>onChange('mentalStatusExam.judgment', e.target.value)} placeholder="Intacto, comprometido" />
              </div>
            </div>
          </div>
        );

      case 5: // Riesgo
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Evaluación de Riesgo y Plan de Seguridad</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5 text-red-600" checked={!!data.risk?.suicidalIdeation} onChange={e=>onChange('risk.suicidalIdeation', e.target.checked)} />
                  <span className="font-medium">Ideación suicida</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5 text-red-600" checked={!!data.risk?.selfHarm} onChange={e=>onChange('risk.selfHarm', e.target.checked)} />
                  <span className="font-medium">Autolesión</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5 text-red-600" checked={!!data.risk?.domesticViolence} onChange={e=>onChange('risk.domesticViolence', e.target.checked)} />
                  <span className="font-medium">Violencia intrafamiliar</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-5 h-5 text-red-600" checked={!!data.risk?.accessToLethalMeans} onChange={e=>onChange('risk.accessToLethalMeans', e.target.checked)} />
                  <span className="font-medium">Acceso a medios letales</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Detalles de ideación suicida (plan, intención, método)</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.risk?.suicidalPlan || ''} onChange={e=>onChange('risk.suicidalPlan', e.target.value)} placeholder="¿Tiene un plan? ¿Qué tan específico? ¿Tiene intención de actuar?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia de autolesión</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.risk?.selfHarmHistory || ''} onChange={e=>onChange('risk.selfHarmHistory', e.target.value)} placeholder="Frecuencia, métodos, última vez" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Historia de violencia</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.risk?.violenceHistory || ''} onChange={e=>onChange('risk.violenceHistory', e.target.value)} placeholder="Hacia otros o recibida" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Factores protectores</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.risk?.protectiveFactors || ''} onChange={e=>onChange('risk.protectiveFactors', e.target.value)} placeholder="Razones para vivir, apoyo social, creencias religiosas" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Plan de seguridad</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.risk?.safetyPlan || ''} onChange={e=>onChange('risk.safetyPlan', e.target.value)} placeholder="1. Señales de advertencia
2. Estrategias de afrontamiento
3. Contactos de apoyo
4. Números de emergencia
5. Eliminación de medios letales" />
            </div>
          </div>
        );

      case 6: // Escalas
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Escalas Estandarizadas</h3>
            
            {/* PHQ-9 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3">PHQ-9 - Cuestionario sobre la Salud del Paciente</h4>
              <p className="text-sm text-gray-600 mb-4">Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?</p>
              <p className="text-xs text-gray-500 mb-4">0 = Nunca | 1 = Varios días | 2 = Más de la mitad de los días | 3 = Casi todos los días</p>
              
              {[
                'Poco interés o placer en hacer cosas',
                'Se ha sentido decaído/a, deprimido/a o sin esperanzas',
                'Dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado',
                'Se ha sentido cansado/a o con poca energía',
                'Poco apetito o ha comido en exceso',
                'Se ha sentido mal con usted mismo/a - o que es un fracaso o que ha quedado mal con usted mismo/a o con su familia',
                'Dificultad para concentrarse en cosas como leer el periódico o ver televisión',
                'Se ha movido o hablado tan lento que otras personas podrían haberlo notado - o lo contrario, ha estado tan inquieto/a o agitado/a que se ha movido mucho más de lo normal',
                'Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera'
              ].map((question, idx) => (
                <div key={idx} className="mb-3">
                  <label className="block text-sm mb-1">{idx + 1}. {question}</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2" value={data.scales?.phq9Items?.[idx] || ''} onChange={e=>onChange(`scales.phq9Items.${idx}`, e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="0">0 - Nunca</option>
                    <option value="1">1 - Varios días</option>
                    <option value="2">2 - Más de la mitad de los días</option>
                    <option value="3">3 - Casi todos los días</option>
                  </select>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-white rounded">
                <strong>Puntuación total PHQ-9: </strong>
                <input type="number" min="0" max="27" className="border border-gray-300 rounded px-2 py-1 ml-2" value={data.scales?.phq9 || ''} onChange={e=>onChange('scales.phq9', e.target.value)} placeholder="0-27" />
                <p className="text-xs text-gray-600 mt-2">1-4: Mínima | 5-9: Leve | 10-14: Moderada | 15-19: Moderadamente severa | 20-27: Severa</p>
              </div>
            </div>

            {/* GAD-7 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3">GAD-7 - Escala de Ansiedad Generalizada</h4>
              <p className="text-sm text-gray-600 mb-4">Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?</p>
              <p className="text-xs text-gray-500 mb-4">0 = Nunca | 1 = Varios días | 2 = Más de la mitad de los días | 3 = Casi todos los días</p>
              
              {[
                'Sentirse nervioso/a, ansioso/a o muy alterado/a',
                'No poder parar o controlar su preocupación',
                'Preocuparse demasiado por diferentes cosas',
                'Dificultad para relajarse',
                'Estar tan inquieto/a que es difícil quedarse quieto/a',
                'Irritarse o enojarse con facilidad',
                'Sentir miedo como si algo terrible pudiera pasar'
              ].map((question, idx) => (
                <div key={idx} className="mb-3">
                  <label className="block text-sm mb-1">{idx + 1}. {question}</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2" value={data.scales?.gad7Items?.[idx] || ''} onChange={e=>onChange(`scales.gad7Items.${idx}`, e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="0">0 - Nunca</option>
                    <option value="1">1 - Varios días</option>
                    <option value="2">2 - Más de la mitad de los días</option>
                    <option value="3">3 - Casi todos los días</option>
                  </select>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-white rounded">
                <strong>Puntuación total GAD-7: </strong>
                <input type="number" min="0" max="21" className="border border-gray-300 rounded px-2 py-1 ml-2" value={data.scales?.gad7 || ''} onChange={e=>onChange('scales.gad7', e.target.value)} placeholder="0-21" />
                <p className="text-xs text-gray-600 mt-2">0-4: Mínima | 5-9: Leve | 10-14: Moderada | 15-21: Severa</p>
              </div>
            </div>
          </div>
        );

      case 7: // Diagnóstico
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Diagnóstico DSM-5</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Diagnóstico principal</label>
              <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.diagnosis?.primary || ''} onChange={e=>onChange('diagnosis.primary', e.target.value)} placeholder="Ej: Trastorno depresivo mayor" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Código(s) diagnóstico(s)</label>
              <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.diagnosis?.codes || ''} onChange={e=>onChange('diagnosis.codes', e.target.value)} placeholder="Ej: F32.1, F41.1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Criterios DSM-5 cumplidos</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.diagnosis?.criteria || ''} onChange={e=>onChange('diagnosis.criteria', e.target.value)} placeholder="Listar criterios específicos del DSM-5 que cumple el paciente" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Diagnóstico(s) secundario(s)</label>
              <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.diagnosis?.secondary || ''} onChange={e=>onChange('diagnosis.secondary', e.target.value)} placeholder="Comorbilidades" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Diagnóstico diferencial</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={2} value={data.diagnosis?.differentialDiagnosis || ''} onChange={e=>onChange('diagnosis.differentialDiagnosis', e.target.value)} placeholder="Otros diagnósticos considerados y descartados" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Severidad</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.diagnosis?.severity || ''} onChange={e=>onChange('diagnosis.severity', e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="grave">Grave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Especificadores</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.diagnosis?.specifiers || ''} onChange={e=>onChange('diagnosis.specifiers', e.target.value)} placeholder="Ej: con características ansiosas" />
              </div>
            </div>
          </div>
        );

      case 8: // Plan TCC
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Plan de Tratamiento TCC</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Objetivos terapéuticos (SMART)</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.goalsAndPlan?.treatmentGoals || ''} onChange={e=>onChange('goalsAndPlan.treatmentGoals', e.target.value)} placeholder="Específicos, Medibles, Alcanzables, Relevantes, con Tiempo definido" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Técnicas TCC planificadas</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={4} value={data.goalsAndPlan?.cbtTechniquesPlanned || ''} onChange={e=>onChange('goalsAndPlan.cbtTechniquesPlanned', e.target.value)} placeholder="Ej: Reestructuración cognitiva, activación conductual, exposición gradual, relajación, mindfulness, registro de pensamientos" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frecuencia de sesiones</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.goalsAndPlan?.sessionFrequency || ''} onChange={e=>onChange('goalsAndPlan.sessionFrequency', e.target.value)} placeholder="Ej: Semanal" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duración estimada</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" value={data.goalsAndPlan?.estimatedDuration || ''} onChange={e=>onChange('goalsAndPlan.estimatedDuration', e.target.value)} placeholder="Ej: 12-16 sesiones" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tareas para casa planificadas</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.goalsAndPlan?.homeworkPlanned || ''} onChange={e=>onChange('goalsAndPlan.homeworkPlanned', e.target.value)} placeholder="Tipos de tareas que se asignarán" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Indicadores de progreso</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={3} value={data.goalsAndPlan?.progressIndicators || ''} onChange={e=>onChange('goalsAndPlan.progressIndicators', e.target.value)} placeholder="¿Cómo se medirá el progreso?" />
            </div>
          </div>
        );

      case 9: // Consentimiento
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-headingColor mb-4">Consentimiento Informado y Confidencialidad</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Declaración de consentimiento</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primaryColor focus:border-transparent" rows={6} value={data.consent?.statement || ''} onChange={e=>onChange('consent.statement', e.target.value)} placeholder="Resumen de lo discutido sobre el proceso terapéutico, confidencialidad y sus límites" />
            </div>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <label className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1 w-5 h-5" checked={!!data.consent?.informedConsent} onChange={e=>onChange('consent.informedConsent', e.target.checked)} />
                <span className="text-sm">El paciente ha sido informado sobre el proceso de terapia cognitivo-conductual, incluyendo beneficios, riesgos y alternativas.</span>
              </label>
              <label className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1 w-5 h-5" checked={!!data.consent?.confidentialityExplained} onChange={e=>onChange('consent.confidentialityExplained', e.target.checked)} />
                <span className="text-sm">Se han explicado los límites de la confidencialidad (riesgo inminente, abuso, orden judicial).</span>
              </label>
              <label className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1 w-5 h-5" checked={!!data.consent?.limitationsDiscussed} onChange={e=>onChange('consent.limitationsDiscussed', e.target.checked)} />
                <span className="text-sm">Se han discutido las políticas de cancelación, honorarios y límites profesionales.</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-headingColor">📋 Historia Clínica Psicológica</h1>
          <p className="text-textColor mt-1">Terapia Cognitivo-Conductual (TCC) - Evaluación Completa</p>
        </div>
        <Link to="/psychology/clinical-history" className="text-primaryColor hover:underline flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
        <div className="flex border-b">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setCurrentTab(index)}
              className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-colors ${
                currentTab === index
                  ? 'border-b-2 border-primaryColor text-primaryColor bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-xs">{tab.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {renderTabContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setCurrentTab(Math.max(0, currentTab - 1))}
          disabled={currentTab === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        
        <div className="text-sm text-gray-600">
          Paso {currentTab + 1} de {tabs.length}
        </div>

        {currentTab === tabs.length - 1 ? (
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Guardando...' : 'Guardar Historia Clínica'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab(Math.min(tabs.length - 1, currentTab + 1))}
            className="px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Siguiente
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ClinicalHistoryForm;
