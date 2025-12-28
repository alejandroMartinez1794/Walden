// Frontend/src/Dashboard/psychology/patients/PatientFile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import ProgressCharts from '../charts/ProgressCharts';
import AssessmentsList from '../assessments/AssessmentsList';
import RiskBanner from '../../../components/RiskBanner';
import PatientQuickBar from '../../../components/PatientQuickBar';
import SessionToolkit from '../../../components/SessionToolkit';
import RiskMitigationChecklist from '../../../components/RiskMitigationChecklist';
import { useAuthToken } from '../../../hooks/useAuthToken';

const PatientFile = () => {
  const token = useAuthToken();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedSession, setSelectedSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLogId, setSummaryLogId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showRiskModal, setShowRiskModal] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const authToken = token;
      if (!authToken) {
        setError('No autenticado');
        setLoading(false);
        navigate('/login');
        return;
      }
      
      // Fetch patient info
      const patientRes = await fetch(`${BASE_URL}/psychology/patients/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const patientData = await patientRes.json();
      if (patientRes.status === 401) { navigate('/login'); return; }
      if (!patientRes.ok) throw new Error(patientData.message);
      setPatient(patientData.data);

      // Fetch sessions
      const sessionsRes = await fetch(`${BASE_URL}/psychology/patients/${id}/sessions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const sessionsData = await sessionsRes.json();
      if (sessionsRes.ok) setSessions(sessionsData.data || []);

      // Fetch assessments
      const assessmentsRes = await fetch(`${BASE_URL}/psychology/patients/${id}/assessments`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const assessmentsData = await assessmentsRes.json();
      if (assessmentsRes.ok) setAssessments(assessmentsData.data || []);

      // Fetch treatment plan
      const planRes = await fetch(`${BASE_URL}/psychology/patients/${id}/treatment-plans`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const planData = await planRes.json();
      if (planRes.ok && planData.data && planData.data.length > 0) {
        setTreatmentPlan(planData.data[0]); // Get the most recent plan
      }

      // Fetch alerts
      const alertsRes = await fetch(`${BASE_URL}/clinical/patients/${id}/alerts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const alertsJson = await alertsRes.json();
      if (alertsRes.ok) {
        setAlerts(alertsJson.data || []);
        const suicide = (alertsJson.data || []).find(a => a.type === 'suicide_risk' && !a.resolved);
        if (suicide) setShowRiskModal(true);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      discharged: 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      referred: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      active: 'Activo',
      discharged: 'Alta',
      'on-hold': 'En Pausa',
      referred: 'Referido',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      minimal: 'bg-green-100 text-green-800',
      mínima: 'bg-green-100 text-green-800',
      leve: 'bg-yellow-100 text-yellow-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderada: 'bg-orange-100 text-orange-800',
      moderate: 'bg-orange-100 text-orange-800',
      severa: 'bg-red-100 text-red-800',
      severe: 'bg-red-100 text-red-800',
      'moderadamente-severa': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[severity] || 'bg-gray-100 text-gray-800'}`}>
        {severity}
      </span>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!patient) return <Error message="Paciente no encontrado" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-headingColor flex items-center gap-3">
              {patient.personalInfo?.fullName}
              {getStatusBadge(patient.status)}
            </h1>
            <p className="text-textColor mt-1">{patient.personalInfo?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <PatientQuickBar patientId={id} onSummary={({ summary, logId }) => { setSummary(summary); setSummaryLogId(logId); }} />
            <Link
              to={`/psychology/patients/${id}/clinical-history`}
              className="bg-white border border-primaryColor text-primaryColor px-6 py-3 rounded-lg hover:bg-blue-50 transition-all"
            >
              Historia Clínica
            </Link>
            <Link
              to={`/psychology/patients/${id}/session`}
              className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Nueva Sesión
            </Link>
          </div>
        </div>

        {/* Risk Alert */}
        <RiskBanner patientId={id} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'info', label: 'Información General', icon: '👤' },
            { id: 'sessions', label: 'Historial de Sesiones', icon: '📋', count: sessions.length },
            { id: 'assessments', label: 'Evaluaciones', icon: '📊', count: assessments.length },
            { id: 'treatment', label: 'Plan de Tratamiento', icon: '🎯' },
            { id: 'charts', label: 'Gráficas', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primaryColor text-primaryColor'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {summary && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 p-4 rounded border">
                    <h2 className="text-xl font-bold mb-2">Resumen Clínico</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{summary.formulation}</p>
                  </div>
                </div>
                <SessionToolkit summary={summary} logId={summaryLogId} onAccepted={() => {/* optionally refresh */}} />
              </div>
            )}
            {showRiskModal && alerts.find(a=>a.type==='suicide_risk') && (
              <RiskMitigationChecklist alert={alerts.find(a=>a.type==='suicide_risk')} onClose={()=>setShowRiskModal(false)} onUpdated={()=>fetchPatientData()} />
            )}
            {/* Personal Info */}
            <div>
              <h2 className="text-xl font-bold text-headingColor mb-4">Información Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Edad</label>
                  <p className="text-gray-900">{patient.personalInfo?.age} años</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Género</label>
                  <p className="text-gray-900">{patient.personalInfo?.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{patient.personalInfo?.phone || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ocupación</label>
                  <p className="text-gray-900">{patient.personalInfo?.occupation || 'No especificada'}</p>
                </div>
                {patient.personalInfo?.maritalStatus && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado Civil</label>
                    <p className="text-gray-900">{patient.personalInfo.maritalStatus}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Info */}
            <div>
              <h2 className="text-xl font-bold text-headingColor mb-4">Información Clínica</h2>
              
              {/* Chief Complaint */}
              {patient.clinicalInfo?.chiefComplaint && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500">Motivo de Consulta</label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{patient.clinicalInfo.chiefComplaint}</p>
                </div>
              )}

              {/* Diagnoses */}
              {patient.clinicalInfo?.diagnoses && patient.clinicalInfo.diagnoses.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Diagnósticos</label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Tipo</th>
                          <th className="px-4 py-2 text-left">Código</th>
                          <th className="px-4 py-2 text-left">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {patient.clinicalInfo.diagnoses.map((dx, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${dx.type === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {dx.type === 'primary' ? 'Principal' : 'Secundario'}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono">{dx.code}</td>
                            <td className="px-4 py-2">{dx.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {patient.clinicalInfo?.riskFactors && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Factores de Riesgo</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(patient.clinicalInfo.riskFactors).map(([key, value]) => (
                      <div key={key} className={`p-3 rounded-lg border ${value ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          {value ? (
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="text-xs font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Medication */}
              {patient.clinicalInfo?.currentMedication && patient.clinicalInfo.currentMedication.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Medicación Actual</label>
                  <ul className="space-y-2">
                    {patient.clinicalInfo.currentMedication.map((med, idx) => (
                      <li key={idx} className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-medium">{med.name}</span> - {med.dosage}
                        {med.prescribedBy && <span className="text-gray-600 text-sm ml-2">(Prescrito por: {med.prescribedBy})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-headingColor">Historial de Sesiones</h2>
              <Link
                to={`/psychology/patients/${id}/session`}
                className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                + Nueva Sesión
              </Link>
            </div>

            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay sesiones registradas</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session._id} className={`border rounded-lg p-4 ${session.criticalSession ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Sesión #{session.sessionNumber}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            session.modality === 'online' ? 'bg-blue-100 text-blue-800' :
                            session.modality === 'phone' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.modality === 'online' ? 'Online' : session.modality === 'phone' ? 'Teléfono' : 'Presencial'}
                          </span>
                          {session.criticalSession && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">
                              ⚠️ Sesión Crítica
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(session.sessionDate).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • Duración: {session.duration} min
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="text-primaryColor hover:text-blue-700 font-medium text-sm"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSession(null)}>
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Sesión #{selectedSession.sessionNumber}</h3>
                    <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-gray-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* SOAP Notes */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Notas SOAP</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="font-medium text-sm text-blue-900">Subjetivo</p>
                          <p className="text-gray-700 mt-1">{selectedSession.soapNotes?.subjective}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="font-medium text-sm text-green-900">Objetivo</p>
                          <p className="text-gray-700 mt-1">{selectedSession.soapNotes?.objective}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="font-medium text-sm text-yellow-900">Evaluación</p>
                          <p className="text-gray-700 mt-1">{selectedSession.soapNotes?.assessment}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="font-medium text-sm text-purple-900">Plan</p>
                          <p className="text-gray-700 mt-1">{selectedSession.soapNotes?.plan}</p>
                        </div>
                      </div>
                    </div>

                    {/* Automatic Thoughts */}
                    {selectedSession.automaticThoughts && selectedSession.automaticThoughts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Pensamientos Automáticos</h4>
                        {selectedSession.automaticThoughts.map((thought, idx) => (
                          <div key={idx} className="border p-3 rounded mb-3">
                            <p className="text-sm"><strong>Situación:</strong> {thought.situation}</p>
                            <p className="text-sm"><strong>Pensamiento:</strong> {thought.automaticThought}</p>
                            <p className="text-sm"><strong>Emoción:</strong> {thought.emotion} (Intensidad: {thought.intensity}/10)</p>
                            {thought.cognitiveDistortion && <p className="text-sm"><strong>Distorsión:</strong> {thought.cognitiveDistortion}</p>}
                            {thought.rationalResponse && <p className="text-sm"><strong>Respuesta Racional:</strong> {thought.rationalResponse}</p>}
                            <p className="text-sm"><strong>Resultado:</strong> Intensidad final {thought.outcomeIntensity}/10</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-headingColor">Evaluaciones Psicológicas</h2>
              <Link
                to="/psychology/assessments/new"
                className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                + Nueva Evaluación
              </Link>
            </div>

            {assessments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay evaluaciones registradas</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.map((assessment) => (
                  <div key={assessment._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{assessment.testType}</h3>
                      {assessment.riskAlert?.flagged && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          ⚠️ Riesgo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(assessment.testDate).toLocaleDateString('es-ES')}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-3xl font-bold text-primaryColor">{assessment.scores.total}</span>
                      {getSeverityBadge(assessment.interpretation?.severity)}
                    </div>
                    {assessment.interpretation?.notes && (
                      <p className="text-xs text-gray-600">{assessment.interpretation.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-headingColor">Evaluaciones</h2>
              <div className="flex items-center gap-2">
                <Link to={`/psychology/assessments/new?patient=${id}`} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">+ Nueva Evaluación</Link>
                <Link to={`/psychology/assessments/phq9?patient=${id}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">PHQ-9</Link>
                <Link to={`/psychology/assessments/gad7?patient=${id}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">GAD-7</Link>
                <Link to={`/psychology/assessments/bdi-ii?patient=${id}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">BDI-II</Link>
              </div>
            </div>
            <AssessmentsList patientId={id} />
          </div>
        )}

        {/* Treatment Plan Tab */}
        {activeTab === 'treatment' && (
          <div>
            <h2 className="text-xl font-bold text-headingColor mb-4">Plan de Tratamiento</h2>
            {treatmentPlan ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Orientación Teórica</label>
                    <p className="text-gray-900">{treatmentPlan.theoreticalOrientation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Frecuencia de Sesiones</label>
                    <p className="text-gray-900">{treatmentPlan.sessionFrequency}</p>
                  </div>
                </div>

                {/* Goals */}
                {treatmentPlan.goals && treatmentPlan.goals.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Objetivos Terapéuticos</h3>
                    <div className="space-y-4">
                      {treatmentPlan.goals.map((goal, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{goal.specific}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                              goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.status === 'achieved' ? 'Logrado' : goal.status === 'in-progress' ? 'En Progreso' : 'No Iniciado'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Meta: {goal.measurable}</p>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progreso</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primaryColor h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Plazo: {goal.timeframe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intervention Techniques */}
                {treatmentPlan.interventionTechniques && treatmentPlan.interventionTechniques.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Técnicas de Intervención</h3>
                    <div className="flex flex-wrap gap-2">
                      {treatmentPlan.interventionTechniques.map((technique, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {technique.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay plan de tratamiento registrado</p>
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div>
            <h2 className="text-xl font-bold text-headingColor mb-4">Evolución Clínica</h2>
            <ProgressCharts patientId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientFile;
