import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const terapiaOnlineBogotaDepresionFaq = buildFAQPageSchema([
  {
    question: '¿Existe terapia online en Bogotá para depresión?',
    answer: 'Sí. Es una ruta útil para personas en Bogotá que buscan iniciar atención virtual por depresión.',
  },
  {
    question: '¿La atención online puede ser un primer paso?',
    answer: 'Sí. Puede facilitar el inicio cuando hay desánimo, cansancio o dificultad para salir.',
  },
]);

export default function TerapiaOnlineBogotaDepresionPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia online en Bogotá para depresión | Basileia"
        description="Terapia online en Bogotá para depresión con acompañamiento clínico y una puerta de entrada sencilla para empezar."
        canonicalPath="/terapia-online-bogota-depresion"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), terapiaOnlineBogotaDepresionFaq]}
      />

      <main className="route-shell route-terapia-online-bogota-depresion">
        <section className="route-panel">
          <p className="eyebrow">Bogotá · Depresión</p>
          <h1>Terapia online en Bogotá para depresión con continuidad y claridad</h1>

          <p>
            Si estás buscando terapia online en Bogotá para depresión, esta página reúne una ruta directa para empezar sin barreras innecesarias.
          </p>

          <h2>Qué suele trabajar</h2>
          <ul>
            <li>Baja energía, desánimo y aislamiento.</li>
            <li>Rutina, activación y objetivos pequeños.</li>
            <li>Seguimiento clínico adaptable al ritmo de cada persona.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/terapia-online-depresion" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver terapia online para depresión
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