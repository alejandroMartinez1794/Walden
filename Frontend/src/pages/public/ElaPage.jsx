import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const elaFaq = buildFAQPageSchema([
  {
    question: '¿Cómo puede ayudar la psicología en ELA?',
    answer: 'Puede ayudar a sostener la adaptación emocional, la comunicación familiar, el duelo anticipado y la carga del cuidador mientras avanza la enfermedad.',
  },
  {
    question: '¿Atienden también a cuidadores y familias?',
    answer: 'Sí. El apoyo a cuidadores es parte central del proceso, porque el impacto emocional de la ELA alcanza a todo el sistema familiar.',
  },
]);

export default function ElaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="ELA: apoyo psicológico para pacientes, familias y cuidadores | Basileia"
        description="Acompañamiento psicológico para ELA: adaptación al diagnóstico, duelo anticipado, apoyo a cuidadores y recursos para la toma de decisiones en familia."
        canonicalPath="/ela"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), elaFaq]}
      />

      <main className="route-shell route-ela">
        <section className="route-panel">
          <p className="eyebrow">ELA</p>
          <h1>Apoyo psicológico para ELA en pacientes, familias y cuidadores</h1>

          <p>
            La Esclerosis Lateral Amiotrófica no solo cambia la función motora; también reorganiza rutinas, roles familiares y la manera de afrontar el futuro. Este espacio ofrece orientación clínica pública para entender qué apoyo puede ayudar durante el proceso.
          </p>

          <h2>Qué trabajamos en consulta</h2>
          <ul>
            <li>Adaptación emocional al diagnóstico y a la progresión de síntomas.</li>
            <li>Procesos de duelo anticipado y toma de decisiones compartidas.</li>
            <li>Comunicación familiar en momentos de incertidumbre o sobrecarga.</li>
            <li>Estrategias de autocuidado para cuidadores principales y secundarios.</li>
          </ul>

          <h2>Señales de sobrecarga que no conviene ignorar</h2>
          <p>
            Dormir mal de forma persistente, sentirse desbordado la mayor parte del día, aislarse o dejar de pedir ayuda suelen ser señales de que hace falta apoyo adicional.
          </p>

          <h2>Para quién es esta página</h2>
          <p>
            Está pensada para personas con ELA, familiares que necesitan orientación clara y cuidadores que buscan sostener el proceso sin agotarse por completo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Pedir orientación
            </Link>
            <Link to="/cuidadores" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver apoyo para cuidadores
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}