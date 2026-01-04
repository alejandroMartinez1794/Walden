import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthToken } from '../../../hooks/useAuthToken';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';

const ClinicalHistoryView = ({ patientId }) => {
  const token = useAuthToken();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/psychology/patients/${patientId}/clinical-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (patientId && token) fetchHistory();
  }, [patientId, token]);

  if (loading) return <Loading />;
  
  if (!history) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No se ha registrado la historia clínica completa aún.</p>
        <Link 
          to={`/psychology/patients/${patientId}/clinical-history`}
          className="bg-primaryColor text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Completar Historia Clínica
        </Link>
      </div>
    );
  }

  const Section = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-headingColor mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-4 text-gray-700">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    value ? (
      <div className="mb-3">
        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <p className="mt-1 whitespace-pre-wrap">{value}</p>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link 
          to={`/psychology/patients/${patientId}/clinical-history`}
          className="text-primaryColor hover:underline font-medium flex items-center gap-1"
        >
          ✏️ Editar Historia Clínica
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <Section title="Motivo de Consulta" icon="📝">
            <Field label="Queja Principal" value={history.intake?.chiefComplaint} />
            <Field label="Preocupaciones Actuales" value={history.intake?.presentingConcerns} />
            <Field label="Fuente de Referencia" value={history.intake?.referralSource} />
          </Section>

          <Section title="Problema Actual" icon="🔍">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Inicio" value={history.currentProblemHistory?.onset} />
              <Field label="Duración" value={history.currentProblemHistory?.duration} />
              <Field label="Frecuencia" value={history.currentProblemHistory?.frequency} />
              <Field label="Severidad" value={history.currentProblemHistory?.severity ? `${history.currentProblemHistory.severity}/10` : null} />
            </div>
            <Field label="Disparadores" value={history.currentProblemHistory?.triggers} />
            <Field label="Factores de Mantenimiento" value={history.currentProblemHistory?.maintainingFactors} />
            <Field label="Contenido Cognitivo" value={history.currentProblemHistory?.cognitiveContent} />
            <Field label="Respuesta Emocional" value={history.currentProblemHistory?.emotionalResponse} />
            <Field label="Patrones Conductuales" value={history.currentProblemHistory?.behavioralPatterns} />
          </Section>

          <Section title="Análisis Funcional" icon="⚙️">
            <Field label="Antecedentes" value={history.functionalAnalysis?.antecedents} />
            <Field label="Conducta Problema" value={history.functionalAnalysis?.behavior} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Consecuencias (Corto Plazo)" value={history.functionalAnalysis?.consequencesShortTerm} />
              <Field label="Consecuencias (Largo Plazo)" value={history.functionalAnalysis?.consequencesLongTerm} />
            </div>
          </Section>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <Section title="Diagnóstico Multiaxial" icon="🏥">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <Field label="Diagnóstico Principal" value={history.diagnosis?.primary} />
              <Field label="Diagnóstico Secundario" value={history.diagnosis?.secondary} />
              <Field label="Especificadores" value={history.diagnosis?.specifiers} />
            </div>
            <div className="mt-4">
              <Field label="Criterios Cumplidos" value={history.diagnosis?.criteria} />
              <Field label="Diagnóstico Diferencial" value={history.diagnosis?.differentialDiagnosis} />
            </div>
          </Section>

          <Section title="Examen Mental" icon="🧠">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Apariencia" value={history.mentalStatusExam?.appearance} />
              <Field label="Comportamiento" value={history.mentalStatusExam?.behavior} />
              <Field label="Ánimo" value={history.mentalStatusExam?.mood} />
              <Field label="Afecto" value={history.mentalStatusExam?.affect} />
              <Field label="Pensamiento" value={history.mentalStatusExam?.thought} />
              <Field label="Percepción" value={history.mentalStatusExam?.perception} />
              <Field label="Insight" value={history.mentalStatusExam?.insight} />
              <Field label="Juicio" value={history.mentalStatusExam?.judgment} />
            </div>
          </Section>

          <Section title="Riesgo" icon="⚠️">
            <div className="flex flex-wrap gap-2 mb-4">
              {history.risk?.suicidalIdeation && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">Ideación Suicida</span>}
              {history.risk?.selfHarm && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-bold">Autolesión</span>}
              {history.risk?.domesticViolence && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">Violencia Doméstica</span>}
            </div>
            <Field label="Plan de Seguridad" value={history.risk?.safetyPlan} />
            <Field label="Factores Protectores" value={history.risk?.protectiveFactors} />
          </Section>

          <Section title="Historia Personal" icon="📖">
            <Field label="Familia" value={history.personalHistory?.family} />
            <Field label="Infancia" value={history.personalHistory?.childhood} />
            <Field label="Relaciones" value={history.personalHistory?.relationships} />
            <Field label="Trabajo/Educación" value={`${history.personalHistory?.work || ''}\n${history.personalHistory?.education || ''}`} />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ClinicalHistoryView;
