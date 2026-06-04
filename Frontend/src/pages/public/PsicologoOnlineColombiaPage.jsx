import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineColombiaFaq = buildFAQPageSchema([
  {
    question: '¿Es lo mismo buscar psicólogo online que psicología virtual?',
    answer: 'En la práctica suelen referirse a atención psicológica por internet, aunque algunas personas usan un término u otro al buscar.',
  },
  {
    question: '¿Atienden motivos de consulta diversos?',
    answer: 'Sí. Podemos acompañar ansiedad, depresión, duelo, crisis, cuidadores y otros motivos frecuentes.',
  },
]);

export default function PsicologoOnlineColombiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Colombia | Basileia"
        description="Psicólogo online en Colombia para quienes necesitan atención psicológica por internet con acceso responsable y enfoque clínico."
        canonicalPath="/psicologo-online-colombia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineColombiaFaq]}
      />

      <main className="route-shell route-psicologo-online-colombia">
        <section className="route-panel">
          <p className="eyebrow">Psicología online</p>
          <h1>Psicólogo online en Colombia para empezar sin complicaciones</h1>

          <p>
            Cuando alguien busca psicólogo online en Colombia, normalmente quiere rapidez, claridad y una experiencia seria. Esa es justo la entrada que construimos aquí.
          </p>

          <h2>Qué puedes esperar</h2>
          <ul>
            <li>Orientación inicial clara sobre el motivo de consulta.</li>
            <li>Atención virtual con estructura y seguimiento.</li>
            <li>Acceso público desde distintas regiones del país.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-en-linea" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología en línea
            </Link>
            <Link to="/psicologia-colombia" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver psicología en Colombia
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}