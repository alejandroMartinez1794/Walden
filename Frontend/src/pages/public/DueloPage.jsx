import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

export default function DueloPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Duelo y acompañamiento emocional | Basileia"
        description="Guía breve para acompañar procesos de duelo: recursos, pasos iniciales y cuándo considerar acompañamiento profesional."
        canonicalPath="/duelo"
      />
      <main className="route-shell route-duelo">
        <section className="route-panel">
          <p className="eyebrow">Duelo</p>
          <h1>Acompañamiento en el duelo: primeros pasos</h1>
          <p>Recursos y orientaciones para sostenerte en procesos de pérdida, con respeto y seguridad.</p>
        </section>
      </main>
    </>
  );
}
