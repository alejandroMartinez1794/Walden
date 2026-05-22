import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

export default function CuidadoresPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Apoyo para cuidadores | Recursos y autocuidado | Basileia"
        description="Recursos para cuidadores: estrategias de autocuidado, manejo del estrés y cómo acceder a apoyo psicológico."
        canonicalPath="/cuidadores"
      />
      <main className="route-shell route-cuidadores">
        <section className="route-panel">
          <p className="eyebrow">Cuidadores</p>
          <h1>Recursos y autocuidado para cuidadores</h1>
          <p>Consejos prácticos para el autocuidado y recursos para quienes acompañan a personas con enfermedades crónicas o en procesos de vulnerabilidad.</p>
        </section>
      </main>
    </>
  );
}
