import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué entendemos por enfermedades limitantes para la vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son condiciones sin cura con riesgo de muerte prematura donde el acompañamiento psicológico es esencial durante meses o años (ej. cáncer avanzado, ELA, fallas orgánicas severas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué apoyo ofrecemos a pacientes y cuidadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Acompañamiento psicoterapéutico, manejo del duelo anticipado, psicoeducación sobre síntomas y apoyo específico para cuidadores y familias.',
      },
    },
  ],
};

export default function EnfermedadesCronicasPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Enfermedades crónicas avanzadas y condiciones limitantes para la vida | Basileia"
        description="Acompañamiento psicológico para personas con enfermedades crónicas avanzadas, hemato-oncológicas y neurodegenerativas, y apoyo especializado a sus cuidadores."
        canonicalPath="/enfermedades-cronicas"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: 'Basileia',
            url: 'https://basileia.tech',
            medicalSpecialty: ['Psychology', 'PalliativeCare', 'Psycho-oncology'],
          },
          FAQ,
        ]}
      />

      <main className="route-shell route-enfermedades-cronicas">
        <section className="route-panel">
          <p className="eyebrow">Enfermedades Crónicas</p>
          <h1>Acompañamiento en enfermedades crónicas, avanzadas o limitantes para la vida</h1>

          <p>Ofrecemos soporte psicológico especializado para personas que viven con condiciones complejas —incluyendo cánceres avanzados, enfermedades hemato-oncológicas, y enfermedades neurodegenerativas como ELA o Esclerosis Múltiple— y acompañamiento integral a sus familias y cuidadores.</p>

          <h2>¿A quién acompañamos?</h2>
          <ul>
            <li>Pacientes con enfermedades limitantes para la vida (condiciones con impacto pronóstico significativo).</li>
            <li>Personas con enfermedades crónicas avanzadas que generan desgaste emocional prolongado.</li>
            <li>Cuidadores familiares que requieren estrategias prácticas de autocuidado y manejo del estrés.</li>
          </ul>

          <h2>Qué ofrecemos</h2>
          <ul>
            <li>Psicoterapia adaptada a procesos de enfermedad crónica y duelo anticipado.</li>
            <li>Psicoeducación y herramientas para manejo del dolor y ansiedad asociada al diagnóstico.</li>
            <li>Apoyo específico para cuidadores: planificación de descansos, manejo de la fatiga y redes de apoyo.</li>
          </ul>

          <h2>Opciones de presentación profesional</h2>
          <p>A continuación hay dos opciones de redacción listas para usar en un perfil profesional o portafolio.</p>
          <h3>Opción A — Centrada en la especialidad</h3>
          <p>Brindo acompañamiento psicoterapéutico y soporte emocional a pacientes diagnosticados con enfermedades hemato-oncológicas, crónicas avanzadas y condiciones limitantes para la vida (como la Esclerosis Lateral Amiotrófica - ELA), así como apoyo integral a sus familias y cuidadores.</p>

          <h3>Opción B — Centrada en el proceso</h3>
          <p>Especializado en el apoyo psicológico para personas que transitan por enfermedades de alta complejidad, condiciones neurodegenerativas y procesos de fin de vida, ofreciendo un espacio de contención, procesamiento del duelo anticipado y adaptación al impacto del diagnóstico.</p>

          <h2>Cómo acceder</h2>
          <p>Revisa nuestros <a href="/servicios">servicios</a> o <a href="/contact">contáctanos</a> para una consulta inicial donde evaluamos necesidades y diseñamos un plan de apoyo personalizado.</p>
        </section>
      </main>
    </>
  );
}
