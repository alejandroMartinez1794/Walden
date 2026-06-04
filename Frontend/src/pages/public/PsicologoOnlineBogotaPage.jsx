import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineBogotaFaq = buildFAQPageSchema([
  {
    question: '¿Puedo encontrar psicólogo online en Bogotá?',
    answer: 'Sí. Basileia ofrece atención virtual para personas en Bogotá que buscan acompañamiento clínico sin desplazarse.',
  },
  {
    question: '¿La atención online sirve si necesito empezar pronto?',
    answer: 'Sí. La modalidad online suele facilitar el inicio rápido y la continuidad del proceso desde la ciudad o desde casa.',
  },
]);

export default function PsicologoOnlineBogotaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Bogotá | Basileia"
        description="Psicólogo online en Bogotá con atención clínica, acceso sencillo y acompañamiento para iniciar terapia sin fricción."
        canonicalPath="/psicologo-online-bogota"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineBogotaFaq]}
      />

      <main className="route-shell route-psicologo-online-bogota">
        <section className="route-panel">
          <p className="eyebrow">Bogotá</p>
          <h1>Psicólogo online en Bogotá con acceso rápido y criterio clínico</h1>

          <p>
            Si buscas un psicólogo online en Bogotá, aquí tienes una ruta clara para iniciar atención virtual con continuidad y orientación profesional.
          </p>

          <h2>Qué suele importar</h2>
          <ul>
            <li>Empezar rápido sin perder calidad clínica.</li>
            <li>Contar con un proceso ordenado y continuo.</li>
            <li>Tener una opción que funcione desde casa o desde la ciudad.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologo-bogota" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicólogo en Bogotá
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