import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoVirtualColombiaFaq = buildFAQPageSchema([
  {
    question: '¿Puedo tener un psicólogo virtual en Colombia aunque viva en otra ciudad?',
    answer: 'Sí. La atención virtual permite acompañamiento psicológico desde cualquier ciudad o región del país.',
  },
  {
    question: '¿Qué ventaja tiene buscar psicólogo virtual en Colombia?',
    answer: 'Facilita acceso, continuidad y comodidad sin sacrificar el encuadre clínico ni la calidad de la atención.',
  },
]);

export default function PsicologoVirtualColombiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo virtual en Colombia | Basileia"
        description="Psicólogo virtual en Colombia con atención clínica, acceso desde cualquier región y acompañamiento psicológico responsable."
        canonicalPath="/psicologo-virtual-colombia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoVirtualColombiaFaq]}
      />

      <main className="route-shell route-psicologo-virtual-colombia">
        <section className="route-panel">
          <p className="eyebrow">Atención virtual</p>
          <h1>Psicólogo virtual en Colombia con acceso claro y continuidad clínica</h1>

          <p>
            Si buscas un psicólogo virtual en Colombia, Basileia te ofrece una entrada sencilla para comenzar terapia sin barreras geográficas ni trámites innecesarios.
          </p>

          <h2>Por qué puede servirte</h2>
          <ul>
            <li>Atención desde cualquier ciudad del país.</li>
            <li>Menos fricción para agendar y sostener el proceso.</li>
            <li>Enfoque clínico con objetivos claros desde el inicio.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-virtual" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología virtual
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