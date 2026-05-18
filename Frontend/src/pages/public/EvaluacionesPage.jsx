import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const evaluationCards = [
  {
    title: 'PHQ-9',
    description: 'Exploración breve de síntomas depresivos para apoyo clínico.',
  },
  {
    title: 'GAD-7',
    description: 'Tamizaje corto para ansiedad generalizada y seguimiento inicial.',
  },
  {
    title: 'WHO-5',
    description: 'Indicador de bienestar subjetivo para un primer panorama funcional.',
  },
  {
    title: 'PCL-5',
    description: 'Instrumento de referencia para síntomas relacionados con trauma.',
  },
];

export default function EvaluacionesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <ClinicalSeoHead
        title="Evaluaciones psicológicas | Basileia"
        description="Recorrido público por evaluaciones psicológicas de apoyo, con orientación clara, sin PHI y con acceso accesible en Colombia."
        canonicalPath="/evaluaciones"
        schema={buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION)}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-semibold text-sky-800">
            Acceso público
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Evaluaciones que ayudan a orientar la atención, no a reemplazarla.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Esta página presenta instrumentos breves de apoyo. No contiene resultados clínicos personales ni rutas internas; solo información pública y trazable.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {evaluationCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{card.description}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-950">¿Qué debes esperar?</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>Indicadores de tamizaje y orientación para conversación clínica.</li>
              <li>Resultados que deben interpretarse con criterio profesional.</li>
              <li>Acceso pensado para lectura clara, teclado y contraste alto.</li>
            </ul>
          </article>

          <aside className="rounded-3xl border border-slate-950 bg-slate-950 p-6 text-white sm:p-8">
            <h2 className="text-2xl font-bold">¿Necesitas avanzar?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Si no has iniciado tu proceso, puedes conocer los servicios o entrar a la ruta de crisis si la situación es urgente.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/servicios"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Ver servicios
              </Link>
              <Link
                to="/crisis"
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Ruta de crisis
              </Link>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}