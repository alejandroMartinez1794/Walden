import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaPsicooncologiaCuidadoresFaq = buildFAQPageSchema([
  {
    question: '¿Qué necesita un cuidador de una persona con cáncer?',
    answer: 'Sostén emocional, información clara y descanso. El cuidador también necesita un lugar donde procesar miedo, cansancio y culpa.',
  },
  {
    question: '¿La psicooncología también atiende al cuidador?',
    answer: 'Sí. Cuando el cuidador está desbordado, la intervención puede enfocarse en carga emocional, organización práctica y autocuidado.',
  },
]);

export default function GuiaPsicooncologiaCuidadoresPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicooncología para cuidadores: cómo sostener el proceso | Basileia"
        description="Guía para cuidadores en psicooncología: señales de sobrecarga, autocuidado, organización práctica y apoyo emocional durante el cáncer."
        canonicalPath="/guia-psicooncologia-cuidadores"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaPsicooncologiaCuidadoresFaq]}
      />

      <main className="route-shell route-guia-psicooncologia-cuidadores">
        <section className="route-panel">
          <p className="eyebrow">Guía para cuidadores</p>
          <h1>Psicooncología para cuidadores: cómo sostener sin desbordarte</h1>

          <p>
            Cuando hay cáncer en la familia, el cuidador suele cargar mucho más de lo que se ve. Esta guía pone foco en el lado humano y práctico de sostener ese proceso.
          </p>

          <h2>Lo que más ayuda</h2>
          <ul>
            <li>Hablar de lo que se siente sin actuar como si todo estuviera bien.</li>
            <li>Definir turnos y descansos para que no todo dependa de una persona.</li>
            <li>Buscar espacios propios fuera del rol de cuidado.</li>
          </ul>

          <h2>Señales de sobrecarga</h2>
          <ul>
            <li>Ansiedad al recibir noticias médicas.</li>
            <li>Fatiga emocional o física acumulada.</li>
            <li>Sensación de culpa por descansar o pedir ayuda.</li>
          </ul>

          <h2>Cuándo pedir apoyo psicológico</h2>
          <p>
            Si el cuidador empieza a funcionar en automático y ya no tiene espacio para pensar, sentir o dormir bien, conviene buscar acompañamiento.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicooncologia" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicooncología
            </Link>
            <Link to="/cuidadores" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver recursos para cuidadores
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}