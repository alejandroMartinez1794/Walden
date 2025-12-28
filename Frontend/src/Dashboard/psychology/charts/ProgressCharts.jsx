// Frontend/src/Dashboard/psychology/charts/ProgressCharts.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const ProgressCharts = ({ patientId }) => {
  const token = useAuthToken();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTests, setSelectedTests] = useState(['PHQ-9', 'BDI-II', 'GAD-7', 'BAI']);

  const testConfigs = {
    'PHQ-9': { color: '#3B82F6', maxScore: 27, name: 'PHQ-9 (Depresión)' },
    'BDI-II': { color: '#8B5CF6', maxScore: 63, name: 'BDI-II (Depresión)' },
    'GAD-7': { color: '#10B981', maxScore: 21, name: 'GAD-7 (Ansiedad)' },
    'BAI': { color: '#F59E0B', maxScore: 63, name: 'BAI (Ansiedad)' },
    'PCL-5': { color: '#EF4444', maxScore: 80, name: 'PCL-5 (TEPT)' },
    'OCI-R': { color: '#EC4899', maxScore: 72, name: 'OCI-R (TOC)' },
  };

  const severityZones = {
    'PHQ-9': [
      { y: 5, label: 'Leve', color: '#FEF3C7' },
      { y: 10, label: 'Moderada', color: '#FDE68A' },
      { y: 15, label: 'Mod. Severa', color: '#FCD34D' },
      { y: 20, label: 'Severa', color: '#FBBF24' },
    ],
    'BDI-II': [
      { y: 14, label: 'Leve', color: '#FEF3C7' },
      { y: 20, label: 'Moderada', color: '#FDE68A' },
      { y: 29, label: 'Severa', color: '#FBBF24' },
    ],
    'GAD-7': [
      { y: 5, label: 'Leve', color: '#D1FAE5' },
      { y: 10, label: 'Moderada', color: '#A7F3D0' },
      { y: 15, label: 'Severa', color: '#6EE7B7' },
    ],
    'BAI': [
      { y: 8, label: 'Leve', color: '#D1FAE5' },
      { y: 16, label: 'Moderada', color: '#A7F3D0' },
      { y: 26, label: 'Severa', color: '#6EE7B7' },
    ],
  };

  useEffect(() => {
    if (patientId) {
      fetchAssessments();
    }
  }, [patientId]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/psychology/patients/${patientId}/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setAssessments(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    // Group by date
    const dataByDate = {};
    
    assessments.forEach((assessment) => {
      const date = new Date(assessment.testDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      
      if (selectedTests.includes(assessment.testType)) {
        dataByDate[date][assessment.testType] = assessment.scores.total;
      }
    });

    // Convert to array and sort by date
    return Object.values(dataByDate).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  const toggleTest = (testType) => {
    if (selectedTests.includes(testType)) {
      setSelectedTests(selectedTests.filter((t) => t !== testType));
    } else {
      setSelectedTests([...selectedTests, testType]);
    }
  };

  const getAvailableTests = () => {
    const tests = new Set();
    assessments.forEach((assessment) => {
      tests.add(assessment.testType);
    });
    return Array.from(tests);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const chartData = formatChartData();
  const availableTests = getAvailableTests();

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500">No hay evaluaciones registradas para este paciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Pruebas a Visualizar</h3>
        <div className="flex flex-wrap gap-3">
          {availableTests.map((testType) => {
            const config = testConfigs[testType];
            if (!config) return null;
            
            return (
              <button
                key={testType}
                onClick={() => toggleTest(testType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTests.includes(testType)
                    ? 'bg-primaryColor text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  selectedTests.includes(testType)
                    ? { backgroundColor: config.color }
                    : {}
                }
              >
                {config.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {selectedTests.length > 0 && chartData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Síntomas</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Puntaje', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {selectedTests.map((testType) => {
                const config = testConfigs[testType];
                if (!config) return null;
                
                return (
                  <Line
                    key={testType}
                    type="monotone"
                    dataKey={testType}
                    stroke={config.color}
                    strokeWidth={3}
                    dot={{ r: 6, fill: config.color }}
                    activeDot={{ r: 8 }}
                    name={config.name}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Legend explanation */}
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium mb-2">💡 Interpretación:</p>
            <ul className="space-y-1 ml-4">
              <li>• Una tendencia descendente indica mejoría clínica</li>
              <li>• Picos pueden indicar eventos estresantes o recaídas</li>
              <li>• La estabilidad en puntajes bajos sugiere mantenimiento del progreso</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Seleccione al menos una prueba para visualizar la evolución</p>
        </div>
      )}

      {/* Severity Reference Guide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guía de Severidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedTests.map((testType) => {
            const zones = severityZones[testType];
            if (!zones) return null;
            
            return (
              <div key={testType}>
                <h4 className="font-medium text-gray-900 mb-3">{testConfigs[testType]?.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-200"></div>
                    <span className="text-sm">0-{zones[0].y - 1}: Mínima</span>
                  </div>
                  {zones.map((zone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }}></div>
                      <span className="text-sm">
                        {idx === 0 ? zones[0].y : zones[idx - 1]?.y}-{zone.y - 1}: {zone.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Progreso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedTests.map((testType) => {
            const testAssessments = assessments.filter((a) => a.testType === testType);
            if (testAssessments.length === 0) return null;
            
            const scores = testAssessments.map((a) => a.scores.total);
            const latestScore = scores[scores.length - 1];
            const firstScore = scores[0];
            const change = firstScore - latestScore;
            const changePercent = ((change / firstScore) * 100).toFixed(1);
            
            return (
              <div key={testType} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{testConfigs[testType]?.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primera evaluación:</span>
                    <span className="font-semibold">{firstScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última evaluación:</span>
                    <span className="font-semibold">{latestScore}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Cambio:</span>
                    <span className={`font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {change > 0 ? '↓' : change < 0 ? '↑' : '='} {Math.abs(change)} ({Math.abs(changePercent)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
