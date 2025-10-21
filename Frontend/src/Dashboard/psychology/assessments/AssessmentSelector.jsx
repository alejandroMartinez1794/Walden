// Frontend/src/Dashboard/psychology/assessments/AssessmentSelector.jsx
import { Link } from 'react-router-dom';

const AssessmentSelector = () => {
  const assessments = [
    {
      title: 'PHQ-9',
      fullName: 'Patient Health Questionnaire-9',
      description: 'Cuestionario de 9 ítems para evaluar severidad de síntomas depresivos',
      duration: '5-10 minutos',
      path: '/psychology/assessments/phq9',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'BDI-II',
      fullName: 'Beck Depression Inventory-II',
      description: 'Inventario de 21 ítems para medir severidad de depresión',
      duration: '10-15 minutos',
      path: '/psychology/assessments/bdi-ii',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'BAI',
      fullName: 'Beck Anxiety Inventory',
      description: 'Inventario de 21 ítems para evaluar severidad de ansiedad',
      duration: '10 minutos',
      path: '/psychology/assessments/bai',
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'GAD-7',
      fullName: 'Generalized Anxiety Disorder-7',
      description: 'Cuestionario de 7 ítems para trastorno de ansiedad generalizada',
      duration: '5 minutos',
      path: '/psychology/assessments/gad7',
      color: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'PCL-5',
      fullName: 'PTSD Checklist for DSM-5',
      description: 'Checklist de 20 ítems para síntomas de estrés postraumático',
      duration: '10-15 minutos',
      path: '/psychology/assessments/pcl5',
      color: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'OCI-R',
      fullName: 'Obsessive-Compulsive Inventory-Revised',
      description: 'Inventario de 18 ítems para síntomas obsesivo-compulsivos',
      duration: '10 minutos',
      path: '/psychology/assessments/ocir',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Evaluaciones Psicológicas</h1>
        <p className="text-textColor mt-1">Seleccione el tipo de evaluación que desea administrar</p>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <Link
            key={assessment.title}
            to={assessment.path}
            className="block"
          >
            <div className={`${assessment.color} text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col`}>
              <div className="flex items-center justify-center mb-4">
                {assessment.icon}
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">{assessment.title}</h3>
              <p className="text-sm text-center opacity-90 mb-3">{assessment.fullName}</p>
              <div className="flex-grow">
                <p className="text-sm text-center mb-4">{assessment.description}</p>
              </div>
              <div className="flex items-center justify-center text-sm opacity-75">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {assessment.duration}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-blue-800 font-semibold mb-2">Recomendaciones</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Todas las evaluaciones incluyen detección automática de riesgo suicida</li>
              <li>• Los resultados se almacenan en el expediente del paciente</li>
              <li>• Puede visualizar la evolución de los puntajes en gráficas de progreso</li>
              <li>• Se recomienda administrar evaluaciones de forma periódica para monitorear cambios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSelector;
