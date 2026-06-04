import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineBogotaAnsiedadFaq = buildFAQPageSchema([
  {
    question: '¿Puedo pedir psicólogo online en Bogotá para ansiedad?',
    answer: 'Sí. Esta ruta está pensada para personas en Bogotá que quieren atención online enfocada en ansiedad.',
  },
  {
    question: '¿Ayuda si necesito empezar pronto?',
    answer: 'Sí. La modalidad online suele facilitar el primer paso y reducir barreras de acceso.',
  },
]);

export default function PsicologoOnlineBogotaAnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Bogotá para ansiedad | Basileia"
        description="Psicólogo online en Bogotá para ansiedad con acceso claro, atención virtual y una ruta directa para empezar sin fricción."
        canonicalPath="/psicologo-online-bogota-ansiedad"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineBogotaAnsiedadFaq]}
      />

      <main className="route-shell route-psicologo-online-bogota-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Bogotá · Ansiedad</p>
          <h1>Psicólogo online en Bogotá para ansiedad con acceso rápido</h1>

          <p>
            Si buscas un psicólogo online en Bogotá para ansiedad, aquí tienes una entrada pensada para empezar atención virtual con claridad.
          </p>

          <h2>Qué suele abordar</h2>
          <ul>
            <li>Preocupación excesiva, tensión y sobrecarga mental.</li>
            <li>Rutinas de regulación y seguimiento clínico.</li>
            <li>Un proceso que se puede sostener desde casa o desde la ciudad.</li>
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