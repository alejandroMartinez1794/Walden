import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineColombiaDueloFaq = buildFAQPageSchema([
  {
    question: '¿Hay psicólogo online en Colombia para duelo?',
    answer: 'Sí. Esta ruta reúne opciones de acompañamiento online para procesos de pérdida en Colombia.',
  },
  {
    question: '¿Es necesario desplazarse para recibir apoyo?',
    answer: 'No necesariamente. La atención online permite recibir apoyo desde casa o cualquier ciudad del país.',
  },
]);

export default function PsicologoOnlineColombiaDueloPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Colombia para duelo | Basileia"
        description="Psicólogo online en Colombia para duelo: apoyo respetuoso, accesible y continuidad clínica para atravesar la pérdida."
        canonicalPath="/psicologo-online-colombia-duelo"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineColombiaDueloFaq]}
      />

      <main className="route-shell route-psicologo-online-colombia-duelo">
        <section className="route-panel">
          <p className="eyebrow">Colombia · Duelo</p>
          <h1>Psicólogo online en Colombia para duelo con acompañamiento humano</h1>

          <p>
            Si buscas apoyo por una pérdida, esta página reúne la ruta para acceder a psicólogos online en Colombia con énfasis en duelo.
          </p>

          <h2>Cuándo puede servir</h2>
          <ul>
            <li>Cuando la pérdida genera dificultades para el sueño, el apetito o el funcionamiento diario.</li>
            <li>Si buscas un espacio clínico seguro para hablar de la pérdida.</li>
            <li>Atención que se puede mantener por modalidad online desde cualquier ciudad.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologo-online-duelo" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicólogo online para duelo
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Escribir ahora
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
