import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineColombiaAnsiedadFaq = buildFAQPageSchema([
  {
    question: '¿Puedo pedir psicólogo online en Colombia para ansiedad?',
    answer: 'Sí. Esta ruta está pensada para personas en Colombia que quieren atención online enfocada en ansiedad.',
  },
  {
    question: '¿La atención online funciona en todas las ciudades?',
    answer: 'Sí. Ofrecemos atención virtual que puede realizarse desde cualquier ciudad del país.',
  },
]);

export default function PsicologoOnlineColombiaAnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Colombia para ansiedad | Basileia"
        description="Psicólogo online en Colombia para ansiedad: atención virtual accesible, continuidad clínica y una ruta directa para empezar."
        canonicalPath="/psicologo-online-colombia-ansiedad"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineColombiaAnsiedadFaq]}
      />

      <main className="route-shell route-psicologo-online-colombia-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Colombia · Ansiedad</p>
          <h1>Psicólogo online en Colombia para ansiedad con acceso nacional</h1>

          <p>
            Si necesitas atención por ansiedad y buscas opciones online en Colombia, esta ruta te guía hacia un proceso clínico claro y accesible.
          </p>

          <h2>Qué suele trabajar</h2>
          <ul>
            <li>Preocupación persistente, tensión y síntomas somáticos relacionados.</li>
            <li>Técnicas de regulación, exposición gradual y seguimiento clínico.</li>
            <li>Atención que puede realizarse desde cualquier ciudad del país.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologo-online-ansiedad" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicólogo online para ansiedad
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Escribir ahora
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
