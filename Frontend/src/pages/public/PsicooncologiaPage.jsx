import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psychoOncologyFaq = buildFAQPageSchema([
  {
    question: '¿Qué hace la psicooncología?',
    answer: 'Acompaña el impacto emocional del cáncer, el tratamiento y la vida familiar, con estrategias para ansiedad, incertidumbre, adherencia y duelo.',
  },
  {
    question: '¿También orienta a cuidadores?',
    answer: 'Sí. La carga del cuidador y la coordinación familiar suelen ser parte central del proceso psicooncológico.',
  },
]);

export default function PsicooncologiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicooncología: apoyo psicológico en cáncer avanzado | Basileia"
        description="Psicooncología para cáncer avanzado y tratamientos complejos: adaptación emocional, comunicación familiar, ansiedad y soporte a cuidadores."
        canonicalPath="/psicooncologia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psychoOncologyFaq]}
      />

      <main className="route-shell route-psicooncologia">
        <section className="route-panel">
          <p className="eyebrow">Psicooncología</p>
          <h1>Acompañamiento psicológico en cáncer avanzado y tratamiento oncológico</h1>

          <p>
            El cáncer impacta en el cuerpo, pero también en la identidad, la familia y la forma de tomar decisiones. La psicooncología ofrece un espacio para sostener ese proceso con información clara y apoyo clínico.
          </p>

          <h2>En qué puede ayudar</h2>
          <ul>
            <li>Disminuir ansiedad frente a diagnósticos, estudios o cambios del tratamiento.</li>
            <li>Trabajar el miedo a la incertidumbre y a la pérdida de control.</li>
            <li>Facilitar conversaciones difíciles con la familia o el equipo de salud.</li>
            <li>Acompañar a cuidadores en la carga emocional y práctica del día a día.</li>
          </ul>

          <h2>Cuándo pedir apoyo</h2>
          <p>
            Si el cansancio emocional, la angustia o el desánimo empiezan a dominar la rutina, conviene pedir apoyo cuanto antes para que el peso no se acumule solo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/enfermedades-cronicas" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver apoyo para enfermedades crónicas
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Agendar orientación
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}