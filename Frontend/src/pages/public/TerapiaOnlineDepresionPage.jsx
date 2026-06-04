import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const terapiaOnlineDepresionFaq = buildFAQPageSchema([
  {
    question: '¿La terapia online para depresión puede ayudar?',
    answer: 'Sí. Puede ser una forma accesible de comenzar a entender el malestar, recuperar rutina y sostener un proceso clínico.',
  },
  {
    question: '¿Sirve si me cuesta salir de casa?',
    answer: 'Sí. La modalidad online suele facilitar el primer paso cuando hay cansancio, aislamiento o poca energía para desplazarse.',
  },
]);

export default function TerapiaOnlineDepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia online para depresión | Basileia"
        description="Terapia online para depresión con acompañamiento clínico, acceso desde Colombia y una ruta clara para empezar sin fricción."
        canonicalPath="/terapia-online-depresion"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), terapiaOnlineDepresionFaq]}
      />

      <main className="route-shell route-terapia-online-depresion">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Terapia online para depresión con apoyo clínico y continuidad</h1>

          <p>
            Si buscas terapia online para depresión, aquí tienes una entrada pensada para iniciar acompañamiento con menos barreras y más claridad.
          </p>

          <h2>Qué suele trabajar el proceso</h2>
          <ul>
            <li>Baja energía, aislamiento y desánimo persistente.</li>
            <li>Rutina, activación conductual y seguimiento entre sesiones.</li>
            <li>Organización de metas pequeñas y sostenibles.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-online-depresion" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología online para depresión
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Pedir orientación
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}