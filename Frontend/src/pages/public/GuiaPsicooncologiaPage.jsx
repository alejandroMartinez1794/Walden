import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaPsicooncologiaFaq = buildFAQPageSchema([
  {
    question: '¿Qué hace exactamente la psicooncología?',
    answer: 'Acompaña el impacto psicológico del cáncer, el tratamiento y la familia, con herramientas para ansiedad, comunicación y afrontamiento.',
  },
  {
    question: '¿Es solo para pacientes o también para familiares?',
    answer: 'También para familiares y cuidadores, porque el cáncer reorganiza roles, expectativas y carga emocional en todo el sistema de apoyo.',
  },
]);

export default function GuiaPsicooncologiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicooncología: qué es y cuándo buscar apoyo | Basileia"
        description="Guía pública sobre psicooncología: para qué sirve, en qué momentos ayuda y cómo se articula con pacientes y cuidadores."
        canonicalPath="/guia-psicooncologia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaPsicooncologiaFaq]}
      />

      <main className="route-shell route-guia-psicooncologia">
        <section className="route-panel">
          <p className="eyebrow">Guía informativa</p>
          <h1>Psicooncología: qué es y cuándo buscar apoyo psicológico</h1>

          <p>
            La psicooncología ayuda a atravesar el impacto emocional del cáncer y de sus tratamientos. No sustituye el manejo médico, pero sí da sostén para vivir el proceso con más claridad.
          </p>

          <h2>En qué situaciones aporta más</h2>
          <ul>
            <li>Diagnóstico reciente o cambio de tratamiento.</li>
            <li>Incertidumbre ante estudios, resultados o recaídas.</li>
            <li>Agotamiento emocional del paciente o del cuidador.</li>
            <li>Dificultad para hablar de miedos o decisiones familiares.</li>
          </ul>

          <h2>Qué se trabaja</h2>
          <ul>
            <li>Regulación de ansiedad y manejo de pensamientos catastróficos.</li>
            <li>Comunicación con familia y equipo de salud.</li>
            <li>Rutinas de autocuidado realistas durante el tratamiento.</li>
          </ul>

          <h2>Qué hacer si estás buscando ayuda</h2>
          <p>
            Si necesitas orientación, puedes revisar nuestra página de <Link to="/psicooncologia">psicooncología</Link> o escribirnos desde <Link to="/contact">contacto</Link>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicooncologia" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver página de psicooncología
            </Link>
            <Link to="/enfermedades-cronicas" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver apoyo en enfermedades crónicas
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}