import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué puedo hacer ahora si tengo un ataque de ansiedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Respira de forma controlada (4 segundos inhalar, 4 retener, 6 exhalar), busca un lugar seguro, y usa una técnica de grounding (5 cosas que ves, 4 que tocas, 3 que oyes). Si la situación empeora, contacta a servicios de emergencia locales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo debo buscar ayuda profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si los síntomas interfieren con tu trabajo, relaciones o seguridad, o si duran semanas y no mejoran con estrategias básicas, consulta con un profesional de salud mental.',
      },
    },
  ],
};

export default function AnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Ansiedad: señales, técnicas inmediatas y apoyo | Basileia"
        description="Estrategias prácticas para manejar episodios de ansiedad: respiración, grounding, cuando pedir ayuda y recursos de acompañamiento clínico."
        canonicalPath="/ansiedad"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: 'Basileia',
            url: 'https://basileia.tech',
          },
          FAQ,
        ]}
        image="/assets/hero-img01-DgSPPdbp.png"
      />

      <main className="route-shell route-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Ansiedad</p>
          <h1>¿Siento ansiedad? Primeros pasos que funcionan</h1>
          <p>La ansiedad puede aparecer en situaciones de estrés o riesgo percibido. Aquí tienes una guía práctica para actuar de forma segura y reducir la activación en minutos.</p>

          <h2>Técnicas inmediatas</h2>
          <ul>
            <li>Respiración diafragmática: 4s inhalar — 4s retener — 6s exhalar.</li>
            <li>Grounding: nombra 5 cosas que ves, 4 que tocas, 3 que oyes.</li>
            <li>Movimiento suave: caminar lento, estiramientos o cambiar de ambiente.</li>
          </ul>

          <h2>Cuándo pedir ayuda</h2>
          <p>Contacta a un profesional si la ansiedad afecta tu sueño, trabajo o relaciones, o si hay pensamientos de hacerse daño.</p>

          <h2>Recursos y siguientes pasos</h2>
          <p>Si necesitas apoyo profesional, revisa nuestros <a href="/servicios">servicios</a> o <a href="/contact">contáctanos</a> para orientación sobre opciones de atención.</p>
        </section>
      </main>
    </>
  );
}
