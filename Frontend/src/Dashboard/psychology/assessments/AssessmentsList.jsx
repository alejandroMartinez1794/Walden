// Frontend/src/Dashboard/psychology/assessments/AssessmentsList.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const severityClass = (sev) => {
  const map = {
    minimal: 'bg-green-100 text-green-800',
    mínima: 'bg-green-100 text-green-800',
    mild: 'bg-yellow-100 text-yellow-800',
    leve: 'bg-yellow-100 text-yellow-800',
    moderada: 'bg-orange-100 text-orange-800',
    moderate: 'bg-orange-100 text-orange-800',
    'moderadamente-severa': 'bg-red-100 text-red-800',
    severe: 'bg-red-100 text-red-800',
    severa: 'bg-red-100 text-red-800',
    'extremely-severe': 'bg-red-200 text-red-900',
  };
  return map[sev] || 'bg-gray-100 text-gray-800';
};

const testMeta = {
  'PHQ-9': { label: 'PHQ-9 (Depresión)', color: 'text-blue-600', formPath: '/psychology/assessments/phq9' },
  'BDI-II': { label: 'BDI-II (Depresión)', color: 'text-indigo-600', formPath: '/psychology/assessments/bdi-ii' },
  'GAD-7': { label: 'GAD-7 (Ansiedad)', color: 'text-green-600', formPath: '/psychology/assessments/gad7' },
  'BAI': { label: 'BAI (Ansiedad)', color: 'text-purple-600', formPath: '/psychology/assessments/bai' },
  'PCL-5': { label: 'PCL-5 (TEPT)', color: 'text-red-600', formPath: '/psychology/assessments/pcl5' },
  'OCI-R': { label: 'OCI-R (TOC)', color: 'text-yellow-600', formPath: '/psychology/assessments/ocir' },
};

const AssessmentsList = ({ patientId }) => {
  const token = useAuthToken();
  const [search] = useSearchParams();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/psychology/patients/${patientId}/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error al cargar evaluaciones');
        setAssessments(json.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchAssessments();
  }, [patientId]);

  const testsAvailable = useMemo(() => Array.from(new Set(assessments.map(a => a.testType))), [assessments]);
  const filtered = useMemo(() => filter === 'all' ? assessments : assessments.filter(a => a.testType === filter), [assessments, filter]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      {/* Filtros y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm ${filter==='all'?'bg-primaryColor text-white':'bg-gray-100 text-gray-800'}`}>Todas</button>
          {testsAvailable.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-lg text-sm ${filter===t?'bg-primaryColor text-white':'bg-gray-100 text-gray-800'}`}>
              {testMeta[t]?.label || t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/psychology/assessments/new?patient=${patientId}`} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">+ Nueva evaluación</Link>
          {/* Accesos directos */}
          <Link to={`/psychology/assessments/phq9?patient=${patientId}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">PHQ-9</Link>
          <Link to={`/psychology/assessments/gad7?patient=${patientId}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">GAD-7</Link>
          <Link to={`/psychology/assessments/bdi-ii?patient=${patientId}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">BDI-II</Link>
          <Link to={`/psychology/assessments/bai?patient=${patientId}`} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">BAI</Link>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay evaluaciones registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Prueba</th>
                <th className="px-4 py-2 text-left">Puntaje</th>
                <th className="px-4 py-2 text-left">Severidad</th>
                <th className="px-4 py-2 text-left">Riesgo</th>
                <th className="px-4 py-2 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(a.testDate).toLocaleDateString('es-ES')}</td>
                  <td className={`px-4 py-2 font-medium ${testMeta[a.testType]?.color || ''}`}>{testMeta[a.testType]?.label || a.testType}</td>
                  <td className="px-4 py-2">{a.scores?.total}</td>
                  <td className="px-4 py-2">
                    {a.interpretation?.severity ? (
                      <span className={`px-2 py-1 rounded-full ${severityClass(a.interpretation.severity)}`}>{a.interpretation.severity}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {a.riskAlert?.flagged ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">⚠️ {a.riskAlert.reason || 'Alerta'}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600 truncate max-w-[300px]">{a.interpretation?.clinicalNotes || a.interpretation?.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssessmentsList;
