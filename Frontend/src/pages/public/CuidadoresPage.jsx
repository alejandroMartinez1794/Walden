import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo manejo el agotamiento como cuidador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Organiza descansos regulares, delega tareas cuando sea posible y busca redes de apoyo. El autocuidado no es un lujo: es una necesidad para ofrecer cuidado sostenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo encontrar apoyo adicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Busca grupos de apoyo locales o atención psicológica especializada. En Basileia ofrecemos recursos y acompañamiento para cuidadores.',
      },
    },
  ],
};

export default function CuidadoresPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Recursos para cuidadores: autocuidado y apoyo | Basileia"
        description="Consejos prácticos y recursos para cuidadores: manejar el agotamiento, planificar descansos y acceder a apoyo psicológico."
        canonicalPath="/cuidadores"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: 'Basileia',
            url: 'https://basileia.tech',
          },
          FAQ,
        ]}
      />

      <main className="route-shell route-cuidadores">
        <section className="route-panel">
          <p className="eyebrow">Cuidadores</p>
          <h1>Apoyo y autocuidado para quienes cuidan</h1>

          <p>El rol de cuidador puede ser gratificante y exigente. Aquí encontrarás estrategias prácticas para sostener tu bienestar y recursos para pedir ayuda.</p>

          <h2>Estrategias prácticas</h2>
          <ul>
            <li>Planifica descansos programados y busca apoyo familiar o comunitario.</li>
            <li>Mantén hábitos básicos (sueño, alimentación) y actividad física leve.</li>
            <li>Utiliza listas y rutinas para reducir la carga cognitiva.</li>
          </ul>

          <h2>Apoyo disponible</h2>
          <p>Ofrecemos orientación para cuidadores y opciones de acompañamiento psicológico. Visita nuestros <a href="/servicios">servicios</a> o <a href="/contact">contáctanos</a> para una consulta inicial.</p>
          
          <h2>Apoyo para cuidadores de pacientes con enfermedades crónicas avanzadas</h2>
          <p>Entendemos las demandas específicas de cuidar a alguien con cáncer avanzado, enfermedades hemato-oncológicas o condiciones neurodegenerativas (p. ej. ELA, Esclerosis Múltiple, Alzheimer). Ofrecemos:</p>
          <ul>
            <li>Sesiones focalizadas en manejo del estrés y fatiga del cuidador.</li>
            <li>Estrategias prácticas para coordinar cuidados médicos y emocionales.</li>
            <li>Apoyo para el duelo anticipado y la adaptación a cambios funcionales progresivos.</li>
          </ul>
        </section>
      </main>
    </>
  );
}
