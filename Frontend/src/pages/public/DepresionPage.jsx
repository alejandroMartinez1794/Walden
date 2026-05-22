import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo distingo tristeza normal de depresión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La depresión suele incluir cambios persistentes en el ánimo, pérdida de interés, sueño y apetito alterados, y dificultades para funcionar durante al menos dos semanas. Si estos síntomas afectan tu vida diaria, consulta con un profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué opciones de tratamiento existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen intervenciones psicológicas basadas en evidencia (TCC, terapia interpersonal), medicamentos en algunos casos, y planes combinados. Un profesional podrá orientar la mejor opción para tu situación.',
      },
    },
  ],
};

export default function DepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Depresión: señales, recursos y opciones de apoyo | Basileia"
        description="Guía práctica sobre depresión: identificar señales, primeros pasos para pedir ayuda y recursos seguros de atención."
        canonicalPath="/depresion"
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

      <main className="route-shell route-depresion">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Reconocer la depresión y encontrar apoyo seguro</h1>

          <p>La depresión puede manifestarse como persistente tristeza, pérdida de intereses y dificultades para realizar actividades cotidianas. Aquí explicamos señales y pasos concretos.</p>

          <h2>Señales frecuentes</h2>
          <ul>
            <li>Pérdida de interés en actividades antes disfrutadas.</li>
            <li>Fatiga, insomnio o sueño excesivo.</li>
            <li>Dificultad para concentrarse o tomar decisiones.</li>
          </ul>

          <h2>Qué hacer ahora</h2>
          <ol>
            <li>Habla con alguien de confianza y anota los cambios observados.</li>
            <li>Solicita una evaluación con un profesional a través de nuestros <a href="/servicios">servicios</a>.</li>
            <li>Si hay riesgo inmediato de daño, contacta servicios de emergencia locales.</li>
          </ol>

          <h2>Recursos</h2>
          <p>Ofrecemos opciones de acompañamiento clínico. <a href="/contact">Contáctanos</a> para orientación personalizada.</p>
        </section>
      </main>
    </>
  );
}
