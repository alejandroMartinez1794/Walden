// Frontend/src/Dashboard/psychology/assessments/AssessmentSelector.jsx
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AssessmentSelector = () => {
  const activeAssessments = [
    {
      title: 'PHQ-9',
      fullName: 'Patient Health Questionnaire-9',
      description: 'Síntomas depresivos (Pfizer libera su uso clínico/digital)',
      duration: '5-10 minutos',
      path: '/psychology/assessments/phq9',
      color: 'bg-blue-600 hover:bg-blue-700',
      implemented: true,
    },
    {
      title: 'GAD-7',
      fullName: 'Generalized Anxiety Disorder 7-item',
      description: 'Ansiedad generalizada (permiso Pfizer)',
      duration: '5 minutos',
      path: '/psychology/assessments/gad7',
      color: 'bg-green-600 hover:bg-green-700',
      implemented: true,
    },
    {
      title: 'PHQ-15',
      fullName: 'Patient Health Questionnaire-15',
      description: 'Síntomas somáticos (parte del paquete PHQ Screeners)',
      duration: '5-10 minutos',
      implemented: true,
      path: '/psychology/assessments/phq15',
      color: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      title: 'AUDIT',
      fullName: 'Alcohol Use Disorders Identification Test',
      description: 'Riesgo por consumo de alcohol (OMS)',
      duration: '5 minutos',
      implemented: true,
      path: '/psychology/assessments/audit',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: 'WHO-5',
      fullName: 'World Health Organization Well-Being Index',
      description: 'Bienestar subjetivo (OMS/WHO sin royalties)',
      duration: '3 minutos',
      implemented: true,
      path: '/psychology/assessments/who5',
      color: 'bg-sky-600 hover:bg-sky-700',
    },
    {
      title: 'PC-PTSD-5',
      fullName: 'Primary Care PTSD Screen (DSM-5)',
      description: 'Tamizaje TEPT (dominio público VA)',
      duration: '2 minutos',
      implemented: true,
      path: '/psychology/assessments/pc-ptsd-5',
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      title: 'PCL-5',
      fullName: 'PTSD Checklist for DSM-5',
      description: 'Severidad TEPT (dominio público VA)',
      duration: '10 minutos',
      path: '/psychology/assessments/pcl5',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      implemented: true,
    },
    {
      title: 'K10',
      fullName: 'Kessler Psychological Distress Scale (10 ítems)',
      description: 'Malestar psicológico general (uso permitido sin licencia)',
      duration: '3-5 minutos',
      implemented: true,
      path: '/psychology/assessments/k10',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'K6',
      fullName: 'Kessler Psychological Distress Scale (6 ítems)',
      description: 'Versión breve de malestar psicológico (uso permitido sin licencia)',
      duration: '2-3 minutos',
      implemented: true,
      path: '/psychology/assessments/k6',
      color: 'bg-lime-600 hover:bg-lime-700',
    },
  ];

  const conditionalAssessments = [
    {
      title: 'Rosenberg Self-Esteem Scale',
      description: 'Autoestima global. Recomendado pedir autorización si la plataforma es clínica/comercial.',
      notes: 'Esperando autorización',
    },
    {
      title: 'PROMIS Short Forms',
      description: 'Dominios múltiples del NIH (depresión, ansiedad, dolor, fatiga). Requiere aceptar términos HealthMeasures.',
      notes: 'Activar tras aceptar términos NIH',
    },
  ];

  const blockedAssessments = [
    {
      title: 'PSS-10',
      description: 'Perceived Stress Scale. Necesita permiso escrito de los autores antes de publicarla digitalmente.',
    },
    {
      title: 'DAST-10',
      description: 'Drug Abuse Screening Test. Copyright © Harvey Skinner.',
    },
    {
      title: 'ASRS v1.1',
      description: 'Adult ADHD Self-Report Scale. OMS/APA requieren licencia para uso digital.',
    },
    {
      title: 'BDI-II / BAI / STAI / DAS',
      description: 'Inventarios Beck y otras pruebas propietarias. No publicar ítems sin licencia.',
    },
  ];
  
  const catalogAssessments = [
    { title: 'CES-D', fullName: 'Center for Epidemiologic Studies Depression Scale', description: 'Síntomas depresivos (cribado)', duration: '10 minutos', category: 'Depresión' },
    { title: 'DASS-21 (Depresión)', fullName: 'Depression Anxiety Stress Scales', description: 'Subescala de depresión dentro de DASS-21', duration: '5-10 minutos', category: 'Depresión' },

    // Ansiedad
    { title: 'PSWQ', fullName: 'Penn State Worry Questionnaire', description: 'Preocupación patológica (TAG)', duration: '5-10 minutos', category: 'Ansiedad' },
    { title: 'SPIN', fullName: 'Social Phobia Inventory', description: 'Ansiedad social (autorreporte)', duration: '5-10 minutos', category: 'Ansiedad' },
    { title: 'LSAS', fullName: 'Liebowitz Social Anxiety Scale', description: 'Ansiedad social (miedo/evitación)', duration: '10-15 minutos', category: 'Ansiedad' },
    { title: 'PDSS', fullName: 'Panic Disorder Severity Scale', description: 'Severidad de pánico', duration: '5-10 minutos', category: 'Ansiedad' },
    { title: 'ASI-3', fullName: 'Anxiety Sensitivity Index-3', description: 'Sensibilidad a la ansiedad', duration: '5-10 minutos', category: 'Ansiedad' },
    { title: 'DASS-21 (Ansiedad/Estrés)', fullName: 'Depression Anxiety Stress Scales', description: 'Ansiedad y estrés dentro de DASS-21', duration: '5-10 minutos', category: 'Ansiedad' },

    // TOC
    { title: 'Y-BOCS', fullName: 'Yale-Brown Obsessive Compulsive Scale', description: 'Severidad de TOC (clínico/autorreporte según versión)', duration: '10-20 minutos', category: 'TOC' },
    { title: 'DOCS', fullName: 'Dimensional Obsessive-Compulsive Scale', description: 'TOC por dimensiones', duration: '10 minutos', category: 'TOC' },

    // Trauma
    { title: 'IES-R', fullName: 'Impact of Event Scale – Revised', description: 'Síntomas postraumáticos (autorreporte)', duration: '10 minutos', category: 'Trauma' },
    { title: 'CAPS-5', fullName: 'Clinician-Administered PTSD Scale', description: 'PTSD (entrevista clínica estructurada)', duration: '45-60 minutos', category: 'Trauma' },

    // Sueño
    { title: 'ISI', fullName: 'Insomnia Severity Index', description: 'Severidad de insomnio', duration: '3-5 minutos', category: 'Sueño' },
    { title: 'PSQI', fullName: 'Pittsburgh Sleep Quality Index', description: 'Calidad de sueño', duration: '10-15 minutos', category: 'Sueño' },

    // Funcionamiento / calidad de vida
    { title: 'WSAS', fullName: 'Work and Social Adjustment Scale', description: 'Deterioro funcional (trabajo/vida social)', duration: '2-3 minutos', category: 'Funcionamiento' },
    { title: 'SDS', fullName: 'Sheehan Disability Scale', description: 'Discapacidad funcional en dominios clave', duration: '2-3 minutos', category: 'Funcionamiento' },
    { title: 'WHO-5', fullName: 'WHO-5 Well-Being Index', description: 'Bienestar general (breve)', duration: '2 minutos', category: 'Funcionamiento' },
    { title: 'CORE-10', fullName: 'Clinical Outcomes in Routine Evaluation', description: 'Resultados clínicos de rutina (breve)', duration: '5 minutos', category: 'Funcionamiento' },
    { title: 'OQ-45', fullName: 'Outcome Questionnaire', description: 'Outcome general (síntomas/relaciones/rol)', duration: '10-15 minutos', category: 'Funcionamiento' },

    // Alianza / sesión
    { title: 'WAI-SR', fullName: 'Working Alliance Inventory – Short Revised', description: 'Alianza terapéutica', duration: '5-10 minutos', category: 'Proceso terapéutico' },
    { title: 'SRS', fullName: 'Session Rating Scale', description: 'Feedback de sesión (muy breve)', duration: '1-2 minutos', category: 'Proceso terapéutico' },
    { title: 'ORS', fullName: 'Outcome Rating Scale', description: 'Monitoreo breve de outcome', duration: '1-2 minutos', category: 'Proceso terapéutico' },

    // Consumo / hábitos
    { title: 'AUDIT', fullName: 'Alcohol Use Disorders Identification Test', description: 'Riesgo por consumo de alcohol', duration: '5 minutos', category: 'Hábitos' },
    { title: 'DUDIT', fullName: 'Drug Use Disorders Identification Test', description: 'Riesgo por consumo de sustancias', duration: '5 minutos', category: 'Hábitos' },
  ];

  const catalogByCategory = catalogAssessments.reduce((acc, item) => {
    const key = item.category || 'Otros';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Evaluaciones Psicológicas</h1>
        <p className="text-textColor mt-1">Seleccione el instrumento que desea administrar</p>
      </div>

      <div className="mb-10 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Aclaración clave</h3>
        <p className="text-sm text-amber-800">
          En psicometría “libre” no significa dominio público. Clasificamos cada instrumento así:
        </p>
        <ul className="text-sm text-amber-800 mt-3 space-y-1">
          <li>🟢 <strong>Implementar ya</strong>: permiso expreso para uso clínico/digital.</li>
          <li>🟡 <strong>Uso condicional</strong>: permitido si cumples términos (p. ej., no modificar ítems, aceptar licencias).</li>
          <li>🔴 <strong>Permiso requerido</strong>: no publicar ítems sin licencia/autorización.</li>
        </ul>
      </div>

      {/* Open CBT tools (non-proprietary) */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-headingColor">Herramientas TCC abiertas</h2>
        <p className="text-textColor mt-1">Registros clínicos TCC (no propietarios) para trabajo entre sesiones y monitoreo.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/psychology/assessments/cbt/suds" className="block">
            <div className="bg-primaryColor text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l-2 2m2-2l2 2m8 4v7m0 0l-2-2m2 2l2-2M3 12h18" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">SUDS / Evitación</h3>
              <p className="text-sm text-center opacity-90 mb-3">Registro abierto (0–10)</p>
              <div className="flex-grow">
                <p className="text-sm text-center mb-4">Útil para exposición, evitación, urgencia de escape y seguimiento.</p>
              </div>
              <div className="flex items-center justify-center text-sm opacity-75">3-5 minutos</div>
            </div>
          </Link>
              <Link to="/psychology/assessments/cbt/thought-record" className="block">
                <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h6M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H9l-2 2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Registro de Pensamientos</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Reestructuración cognitiva</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Situación → pensamiento → emoción → evidencia → alternativa → plan.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">8-12 minutos</div>
                </div>
              </Link>
              <Link to="/psychology/assessments/cbt/distortions" className="block">
                <div className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Distorsiones cognitivas</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Checklist + pensamiento alternativo</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Identifica sesgos frecuentes y formula alternativas balanceadas.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">5-10 minutos</div>
                </div>
              </Link>
              <Link to="/psychology/assessments/cbt/core-beliefs" className="block">
                <div className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 2.25 3 5 3 5s3-2.75 3-5c0-1.657-1.343-3-3-3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Creencias nucleares</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Reformulación + experimento</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Trabaja creencias centrales, evidencias y plan de prueba conductual.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">8-12 minutos</div>
                </div>
              </Link>
              <Link to="/psychology/assessments/cbt/avoidance" className="block">
                <div className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Conductas de evitación</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Costo-beneficio + aproximación</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Desglosa alivio vs. costo y define el primer paso de exposición.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">6-10 minutos</div>
                </div>
              </Link>
              <Link to="/psychology/assessments/cbt/behavioral-activation" className="block">
                <div className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Activación conductual</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Agenda con valores</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Planifica actividades, estima ánimo y dificultad, y ajusta próximos pasos.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">5-12 minutos</div>
                </div>
              </Link>

          <Link to="/psychology/assessments/cbt/thought-record" className="block">
            <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h6M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H9l-2 2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Registro de Pensamientos</h3>
              <p className="text-sm text-center opacity-90 mb-3">Reestructuración cognitiva</p>
              <div className="flex-grow">
                <p className="text-sm text-center mb-4">Situación → pensamiento → emoción → evidencia → alternativa → plan.</p>
              </div>
              <div className="flex items-center justify-center text-sm opacity-75">8-12 minutos</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Active instruments */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-headingColor">🟢 Activos (permiso expreso)</h2>
        <p className="text-textColor mt-1">Core clínico listo para usar. Respetamos texto original, scoring y atribución.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAssessments.map((assessment) => (
            assessment.implemented && assessment.path ? (
              <Link key={assessment.title} to={assessment.path} className="block">
                <div className={`${assessment.color} text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col`}>
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
            ) : (
              <button
                key={assessment.title}
                type="button"
                onClick={() => toast.info(`${assessment.title} está aprobado para uso clínico, implementación web en progreso.`)}
                className={`${assessment.color} text-white rounded-lg shadow-lg p-6 w-full text-left cursor-pointer opacity-90 hover:opacity-100 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{assessment.title}</h3>
                    <p className="text-sm opacity-90">{assessment.fullName}</p>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Próximo</span>
                </div>
                <p className="mt-3 text-sm opacity-90">{assessment.description}</p>
                <p className="mt-2 text-xs opacity-80">⏱ {assessment.duration}</p>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Herramientas TCC Avanzadas */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-headingColor">🧠 Herramientas Clínicas TCC</h2>
        <p className="text-textColor mt-1">Instrumentos para conceptualización y tratamiento cognitivo-conductual.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/psychology/assessments/case-formulation" className="block">
                <div className="bg-purple-600 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-center mb-2">Formulación de Caso</h3>
                  <p className="text-sm text-center opacity-90 mb-3">Conceptualización Cognitiva</p>
                  <div className="flex-grow">
                    <p className="text-sm text-center mb-4">Mapa clínico completo: Creencias, Estrategias, Análisis Funcional y Plan.</p>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-75">
                    ⏱ 30-45 min
                  </div>
                </div>
            </Link>
        </div>
      </div>

      {/* Conditional */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-headingColor">🟡 Disponibles al activar licencia</h2>
        <p className="text-textColor mt-1">Instrumentos que requieren aceptar términos específicos o autorización del titular.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {conditionalAssessments.map((item) => (
            <div key={item.title} className="border border-yellow-200 bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-headingColor">{item.title}</h3>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">Licencia</span>
              </div>
              <p className="text-sm text-textColor mt-2">{item.description}</p>
              <p className="text-xs text-yellow-700 mt-3">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-headingColor">🔴 No publicar ítems sin licencia</h2>
        <p className="text-textColor mt-1">Se listan para transparencia. No se habilitarán hasta contar con autorización formal.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {blockedAssessments.map((item) => (
            <div key={item.title} className="border border-red-200 bg-red-50 rounded-lg p-5 text-red-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-xs font-semibold bg-red-100 px-3 py-1 rounded-full">Bloqueado</span>
              </div>
              <p className="text-sm mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-headingColor">Catálogo TCC (para ampliar)</h2>
        <p className="text-textColor mt-1">
          Incluye instrumentos frecuentemente usados en TCC. Para administrarlos desde aquí, hay que cargar contenido autorizado/licenciado.
        </p>

        <div className="mt-6 space-y-6">
          {Object.entries(catalogByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-headingColor">{category}</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <button
                    key={`${category}-${item.title}`}
                    type="button"
                    onClick={() => toast.info(`"${item.title}" está en catálogo. Para habilitarlo, hay que cargar ítems/reglas con licencia/autorización.`)}
                    className="text-left rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-headingColor">{item.title}</p>
                        <p className="text-sm text-textColor">{item.fullName}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Catálogo</span>
                    </div>
                    <p className="mt-3 text-sm text-textColor">{item.description}</p>
                    <p className="mt-4 text-xs text-gray-500">⏱ {item.duration}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              <li>• Use las escalas como apoyo para monitoreo y toma de decisiones clínicas</li>
              <li>• Los resultados se almacenan en el expediente del paciente (para las escalas implementadas)</li>
              <li>• Administre escalas de forma periódica para monitorear cambios y adherencia</li>
              <li>• Algunos instrumentos requieren aceptar términos o licencias antes de publicar sus ítems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSelector;
