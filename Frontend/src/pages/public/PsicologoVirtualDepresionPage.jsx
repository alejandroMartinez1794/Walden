import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoVirtualDepresionFaq = buildFAQPageSchema([
  {
    question: '¿Puede ayudar un psicólogo virtual para depresión?',
    answer: 'Sí. La atención virtual puede ser útil para reorganizar rutinas, trabajar pensamientos depresivos y sostener el proceso.',
  },
  {
    question: '¿Qué pasa si me cuesta salir de casa?',
    answer: 'Justamente por eso la modalidad virtual puede ser una muy buena puerta de entrada para empezar tratamiento.',
  },
]);

export default function PsicologoVirtualDepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo virtual para depresión | Basileia"
        description="Psicólogo virtual para depresión con atención clínica, acceso desde cualquier lugar y acompañamiento responsable en Colombia."
        canonicalPath="/psicologo-virtual-depresion"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoVirtualDepresionFaq]}
      />

      <main className="route-shell route-psicologo-virtual-depresion">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Psicólogo virtual para depresión con acceso fácil y proceso ordenado</h1>

          <p>
            Cuando la depresión hace difícil moverse, agendar o sostener energía, la modalidad virtual puede facilitar el primer paso.
          </p>

          <h2>En qué ayuda</h2>
          <ul>
            <li>Recuperar estructura diaria y ritmo de actividad.</li>
            <li>Trabajar desánimo, culpa y pérdida de interés con acompañamiento clínico.</li>
            <li>Avanzar sin depender de traslados o barreras geográficas.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/terapia-depresion-colombia" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver terapia para depresión en Colombia
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