import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Es normal sentir culpa y tristeza intensa en el duelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las reacciones intensas son parte del duelo. Si las emociones impiden funcionar durante meses o incluyen pensamientos de autolesión, busca ayuda profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo apoyar a alguien en duelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Escucha sin juzgar, ofrece acompañamiento práctico (comidas, gestiones) y anima a buscar apoyo profesional si la persona lo necesita.',
      },
    },
  ],
};

export default function DueloPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Duelo: recursos y acompañamiento respetuoso | Basileia"
        description="Orientaciones respetuosas para procesos de duelo: autocuidado, apoyo práctico y cuándo buscar acompañamiento clínico."
        canonicalPath="/duelo"
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

      <main className="route-shell route-duelo">
        <section className="route-panel">
          <p className="eyebrow">Duelo</p>
          <h1>Acompañamiento en procesos de pérdida</h1>

          <p>El duelo es un proceso único. Aquí encontrarás recursos para sostenerte, cuidar tu bienestar y decidir si necesitas apoyo profesional.</p>

          <h2>Estrategias de autocuidado</h2>
          <ul>
            <li>Permítete sentir y marcar momentos para recordar a la persona querida.</li>
            <li>Mantén rutinas básicas de sueño y alimentación.</li>
            <li>Busca apoyo en redes cercanas o en grupos de apoyo.</li>
          </ul>

          <h2>Apoyo profesional</h2>
          <p>Si el duelo incluye pensamientos de autolesión o una incapacidad prolongada para funcionar, busca evaluación clínica. Revisa nuestros <a href="/servicios">servicios</a> o <a href="/contact">contáctanos</a>.</p>
        </section>
      </main>
    </>
  );
}
