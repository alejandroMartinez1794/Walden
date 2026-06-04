import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const ansiedadOnlineFaq = buildFAQPageSchema([
  {
    question: '¿La psicología online sirve para ansiedad?',
    answer: 'Sí. Cuando el proceso está bien estructurado, la terapia online puede ayudar a comprender y manejar la ansiedad de forma efectiva.',
  },
  {
    question: '¿Necesito una crisis para pedir ayuda?',
    answer: 'No. De hecho, conviene buscar apoyo antes de llegar al desborde, cuando la ansiedad ya empieza a afectar sueño, trabajo o relaciones.',
  },
]);

export default function PsicologiaOnlineAnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicología online para ansiedad | Basileia"
        description="Psicología online para ansiedad con atención clínica, herramientas prácticas y acceso desde cualquier lugar de Colombia."
        canonicalPath="/psicologia-online-ansiedad"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), ansiedadOnlineFaq]}
      />

      <main className="route-shell route-psicologia-online-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Ansiedad</p>
          <h1>Psicología online para ansiedad: apoyo estructurado y accesible</h1>

          <p>
            La ansiedad puede mejorar mucho con un proceso online bien llevado. Lo importante es que haya claridad, seguimiento y herramientas concretas, no solo conversación suelta.
          </p>

          <h2>Qué suele trabajarse</h2>
          <ul>
            <li>Identificar detonantes y patrones de pensamiento.</li>
            <li>Regular activación fisiológica y anticipación catastrófica.</li>
            <li>Practicar estrategias que el paciente pueda repetir en la vida diaria.</li>
          </ul>

          <h2>Cuándo conviene pedir ayuda</h2>
          <p>
            Si la ansiedad ya altera sueño, concentración o relaciones, la terapia online puede ser un punto de entrada muy útil.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/ansiedad" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver página de ansiedad
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Pedir orientación
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}