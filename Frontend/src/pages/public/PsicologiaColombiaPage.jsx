import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologiaColombiaFaq = buildFAQPageSchema([
  {
    question: '¿Qué significa buscar psicología en Colombia?',
    answer: 'Significa encontrar atención psicológica con enfoque local, en español, con referencias claras sobre acceso, modalidades y confianza profesional.',
  },
  {
    question: '¿Basileia atiende personas de toda Colombia?',
    answer: 'Sí. Nuestro servicio está pensado para atención virtual y acceso público desde distintas regiones del país.',
  },
]);

export default function PsicologiaColombiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicología en Colombia | Basileia"
        description="Encuentra psicología en Colombia con atención virtual, enfoque clínico y acceso público responsable desde cualquier región del país."
        canonicalPath="/psicologia-colombia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologiaColombiaFaq]}
      />

      <main className="route-shell route-psicologia-colombia">
        <section className="route-panel">
          <p className="eyebrow">Psicología en Colombia</p>
          <h1>Psicología en Colombia con acceso virtual y acompañamiento clínico</h1>

          <p>
            Si estás buscando psicología en Colombia, lo importante no es solo encontrar un nombre. También importa que la atención sea clara, humana y fácil de iniciar sin fricción innecesaria.
          </p>

          <h2>Qué hace diferente a Basileia</h2>
          <ul>
            <li>Atención psicológica virtual para distintas ciudades y regiones del país.</li>
            <li>Enfoque cognitivo-conductual con recursos públicos bien organizados.</li>
            <li>Orientación clara para ansiedad, depresión, duelo, crisis y cuidadores.</li>
          </ul>

          <h2>Si buscas un psicólogo en Colombia</h2>
          <p>
            Puedes comenzar revisando nuestros <Link to="/servicios">servicios</Link> o escribiendo desde <Link to="/contact">contacto</Link> para una orientación inicial.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-virtual" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología virtual
            </Link>
            <Link to="/psicologia-en-linea" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver psicología en línea
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}