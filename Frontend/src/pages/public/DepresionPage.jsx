import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

export default function DepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Depresión: señales y recursos de apoyo | Basileia"
        description="Información práctica sobre la depresión: síntomas, recursos inmediatos y cómo pedir ayuda profesional."
        canonicalPath="/depresion"
      />
      <main className="route-shell route-depresion">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Identificando la depresión y buscando apoyo</h1>
          <p>Señales comunes de depresión y pasos para acceder a apoyo clínico seguro y responsable.</p>
        </section>
      </main>
    </>
  );
}
