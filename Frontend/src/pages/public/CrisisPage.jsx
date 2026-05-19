import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildCrisisFAQSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const crisisFaq = buildCrisisFAQSchema();

export default function CrisisPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <ClinicalSeoHead
        title="Crisis psicológica | Recursos de ayuda inmediata"
        description="Recursos públicos y orientaciones seguras para una crisis psicológica. Información sin PHI, centrada en acceso inmediato y apoyo responsable."
        canonicalPath="/crisis"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), crisisFaq]}
      />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <a href="#crisis-content" className="skip-link">
          Ir al contenido principal
        </a>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <article id="crisis-content" className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-800">
              Atención inmediata
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Si necesitas apoyo ahora, empieza por una acción concreta.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
              Esta página ofrece recursos públicos para crisis psicológica. No reemplaza atención de emergencia, pero sí orienta los primeros pasos con claridad y sin exponer datos sensibles.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href="tel:106"
                className="flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-4 text-center text-base font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
              >
                Llamar al 106
              </a>
              <a
                href="tel:123"
                className="flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-base font-bold text-slate-900 transition hover:border-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                Llamar al 123
              </a>
            </div>

            <section className="mt-10" aria-labelledby="actions-title">
              <h2 id="actions-title" className="text-2xl font-bold text-slate-950">
                Acciones recomendadas
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">1. Busca acompañamiento</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    No permanezcas solo si hay riesgo. Contacta a una persona de confianza o a un servicio de apoyo local.
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">2. Reduce estímulos</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Aléjate de medios de daño si es seguro hacerlo y busca un entorno tranquilo, iluminado y acompañado.
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">3. Escala a emergencia</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Si existe riesgo inminente, usa la línea de emergencia local o acude al servicio de urgencias más cercano.
                  </p>
                </article>
              </div>
            </section>
          </article>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.18)] sm:p-8">
              <h2 className="text-2xl font-bold">¿Cuándo usar esta página?</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <li>Cuando la persona está desbordada y necesita pasos simples.</li>
                <li>Cuando hace falta una referencia pública rápida y sin fricción.</li>
                <li>Cuando no hay tiempo para navegar formularios, cuentas o autenticación.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8" aria-labelledby="faq-title">
              <h2 id="faq-title" className="text-2xl font-bold text-slate-950">
                Preguntas frecuentes
              </h2>
              <div className="mt-4 space-y-4">
                <details className="rounded-2xl border border-amber-200 bg-white p-4" open>
                  <summary className="cursor-pointer font-semibold text-slate-950">
                    ¿Qué hago si necesito ayuda psicológica inmediata?
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Llama a la línea 106 o al número de emergencias local si existe riesgo inmediato, y busca acompañamiento profesional presencial o virtual.
                  </p>
                </details>
                <details className="rounded-2xl border border-amber-200 bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-slate-950">
                    ¿Esta página publica datos clínicos sensibles?
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    No. Solo contiene orientación general, sin historias clínicas, identificadores, tokens ni rutas internas.
                  </p>
                </details>
                <details className="rounded-2xl border border-amber-200 bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-slate-950">
                    ¿Puedo navegar con teclado?
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Sí. La página usa enlaces, encabezados y controles nativos para que el recorrido por teclado sea completo.
                  </p>
                </details>
              </div>
            </section>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-950">Volver al sitio</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Si no estás en crisis inmediata, puedes revisar los servicios públicos y la información institucional.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                >
                  Inicio
                </Link>
                <Link
                  to="/servicios"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                >
                  Servicios
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}