import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoBogotaFaq = buildFAQPageSchema([
  {
    question: '¿Puedo encontrar psicólogo en Bogotá con atención virtual?',
    answer: 'Sí. Basileia ofrece psicología virtual para personas en Bogotá y otras ciudades de Colombia.',
  },
  {
    question: '¿Cómo elijo un psicólogo en Bogotá?',
    answer: 'Conviene revisar enfoque clínico, claridad en la atención, posibilidad de continuidad y si la experiencia conecta con tu motivo de consulta.',
  },
]);

export default function PsicologoBogotaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo en Bogotá | Basileia"
        description="Encuentra psicólogo en Bogotá con atención virtual, enfoque clínico y acceso público responsable desde la capital de Colombia."
        canonicalPath="/psicologo-bogota"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoBogotaFaq]}
      />

      <main className="route-shell route-psicologo-bogota">
        <section className="route-panel">
          <p className="eyebrow">Bogotá</p>
          <h1>Psicólogo en Bogotá con atención virtual y acompañamiento clínico</h1>

          <p>
            Si buscas psicólogo en Bogotá, Basileia te ofrece una ruta clara para iniciar terapia virtual sin perder rigor clínico ni cercanía humana.
          </p>

          <h2>Qué suele importar al elegir</h2>
          <ul>
            <li>Que el enfoque esté claro desde el inicio.</li>
            <li>Que la atención sea accesible, ordenada y sin fricción.</li>
            <li>Que la persona pueda continuar el proceso sin perder seguimiento.</li>
          </ul>

          <h2>Si estás en Bogotá y necesitas empezar ya</h2>
          <p>
            Revisa nuestros <Link to="/servicios">servicios</Link> o escribe desde <Link to="/contact">contacto</Link> para orientación inicial.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-virtual" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología virtual
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