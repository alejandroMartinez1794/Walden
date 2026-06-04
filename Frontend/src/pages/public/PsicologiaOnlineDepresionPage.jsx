import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const depresionOnlineFaq = buildFAQPageSchema([
  {
    question: '¿La psicología online ayuda en depresión?',
    answer: 'Sí. Puede ser un buen inicio para comprender lo que pasa, ordenar el malestar y construir un plan de apoyo clínico.',
  },
  {
    question: '¿Qué pasa si me cuesta mucho pedir ayuda?',
    answer: 'La atención online suele facilitar el primer paso cuando hay cansancio, desánimo o baja energía para moverse.',
  },
]);

export default function PsicologiaOnlineDepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicología online para depresión | Basileia"
        description="Psicología online para depresión con atención clínica, acceso desde Colombia y acompañamiento para empezar con apoyo real."
        canonicalPath="/psicologia-online-depresion"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), depresionOnlineFaq]}
      />

      <main className="route-shell route-psicologia-online-depresion">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Psicología online para depresión con apoyo clínico y acceso accesible</h1>

          <p>
            La psicología online para depresión puede ayudarte a iniciar un proceso cuando cuesta más salir, pedir ayuda o sostener energía para desplazarte.
          </p>

          <h2>Qué suele abordarse</h2>
          <ul>
            <li>Baja motivación, aislamiento y cansancio persistente.</li>
            <li>Rutinas, activación conductual y seguimiento entre sesiones.</li>
            <li>Factores emocionales que mantienen el malestar.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/depresion" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver página de depresión
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