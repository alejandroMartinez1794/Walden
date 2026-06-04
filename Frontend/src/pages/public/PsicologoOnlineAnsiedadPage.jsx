import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineAnsiedadFaq = buildFAQPageSchema([
  {
    question: '¿Sirve buscar psicólogo online para ansiedad?',
    answer: 'Sí. Un proceso online puede ayudarte a identificar disparadores, regular la activación y sostener cambios concretos.',
  },
  {
    question: '¿La atención online es útil si la ansiedad aparece en varios contextos?',
    answer: 'Sí. Puede servir tanto para ansiedad generalizada como para episodios ligados a trabajo, salud, familia o estudio.',
  },
]);

export default function PsicologoOnlineAnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online para ansiedad | Basileia"
        description="Psicólogo online para ansiedad con atención clínica, acceso desde Colombia y acompañamiento orientado a cambios concretos."
        canonicalPath="/psicologo-online-ansiedad"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineAnsiedadFaq]}
      />

      <main className="route-shell route-psicologo-online-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Ansiedad</p>
          <h1>Psicólogo online para ansiedad con acceso claro y enfoque clínico</h1>

          <p>
            Si lo que buscas es un psicólogo online para ansiedad, esta página te ayuda a entrar por una ruta directa, sin perder claridad clínica ni continuidad.
          </p>

          <h2>Qué suele trabajarse</h2>
          <ul>
            <li>Detonantes, pensamientos anticipatorios y señales corporales.</li>
            <li>Herramientas para bajar activación y ganar control en momentos críticos.</li>
            <li>Hábitos que sostienen el avance entre sesiones.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-online-ansiedad" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología online para ansiedad
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