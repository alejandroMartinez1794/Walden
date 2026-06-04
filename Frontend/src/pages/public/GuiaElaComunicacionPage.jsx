import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaElaComunicacionFaq = buildFAQPageSchema([
  {
    question: '¿Por qué cuesta tanto hablar de ELA en familia?',
    answer: 'Porque mezcla miedo, pérdida anticipada y roles nuevos; por eso la conversación suele cargar mucha tensión emocional.',
  },
  {
    question: '¿Puede ayudar la terapia a comunicarnos mejor?',
    answer: 'Sí. La terapia puede ordenar conversaciones difíciles, bajar la reactividad y ayudar a repartir responsabilidades con más claridad.',
  },
]);

export default function GuiaElaComunicacionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Cómo hablar de ELA en familia: guía de comunicación | Basileia"
        description="Guía para comunicar mejor sobre ELA en familia: conversaciones difíciles, roles, límites emocionales y cuándo pedir acompañamiento."
        canonicalPath="/guia-ela-comunicacion"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaElaComunicacionFaq]}
      />

      <main className="route-shell route-guia-ela-comunicacion">
        <section className="route-panel">
          <p className="eyebrow">Guía informativa</p>
          <h1>Cómo hablar de ELA en familia sin que la conversación se rompa</h1>

          <p>
            Hablar de ELA puede activar miedo, tristeza y discusiones. Aun así, una conversación honesta suele ser mejor que el silencio prolongado.
          </p>

          <h2>Qué ayuda antes de conversar</h2>
          <ul>
            <li>Elegir un momento sin prisa ni distracciones.</li>
            <li>Definir qué tema sí se quiere tocar y cuál puede esperar.</li>
            <li>Acordar que nadie tiene que resolver todo en una sola charla.</li>
          </ul>

          <h2>Errores comunes</h2>
          <ul>
            <li>Hablar desde la urgencia o el reproche.</li>
            <li>Suponer que todos entienden igual la situación.</li>
            <li>Cargar a una sola persona con decisiones y emociones.</li>
          </ul>

          <h2>Cuándo pedir ayuda</h2>
          <p>
            Si cada conversación termina en bloqueo, culpa o conflicto, el acompañamiento psicológico puede ayudar a ordenar el diálogo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/ela" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver página ELA
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Contactar
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}