import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

export default function AnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Ansiedad: cómo identificarla y qué hacer | Basileia"
        description="Recursos prácticos y orientación sobre ansiedad: señales, estrategias iniciales y cuándo buscar ayuda profesional."
        canonicalPath="/ansiedad"
      />
      <main className="route-shell route-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Ansiedad</p>
          <h1>¿Siento ansiedad? Primeros pasos prácticos</h1>
          <p>La ansiedad es una respuesta común. Aquí tienes estrategias iniciales, ejercicios respiratorios y cuándo consultar con un profesional.</p>
        </section>
      </main>
    </>
  );
}
