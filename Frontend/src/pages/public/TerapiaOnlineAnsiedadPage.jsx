import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const terapiaOnlineAnsiedadFaq = buildFAQPageSchema([
  {
    question: '¿La terapia online para ansiedad funciona?',
    answer: 'Sí. Con un encuadre claro, la terapia online puede ser muy útil para ansiedad y estrés sostenido.',
  },
  {
    question: '¿Qué diferencia hay entre buscar terapia online y psicología online?',
    answer: 'En la práctica ambas expresiones suelen referirse al mismo servicio de acompañamiento psicológico por internet.',
  },
]);

export default function TerapiaOnlineAnsiedadPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia online para ansiedad | Basileia"
        description="Terapia online para ansiedad con acompañamiento clínico, acceso desde Colombia y herramientas prácticas para el día a día."
        canonicalPath="/terapia-online-ansiedad"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), terapiaOnlineAnsiedadFaq]}
      />

      <main className="route-shell route-terapia-online-ansiedad">
        <section className="route-panel">
          <p className="eyebrow">Ansiedad</p>
          <h1>Terapia online para ansiedad con foco en resultados y accesibilidad</h1>

          <p>
            Si necesitas terapia online para ansiedad, esta página funciona como una entrada comercial y clínica para empezar desde cualquier lugar del país.
          </p>

          <h2>Qué puede incluir el proceso</h2>
          <ul>
            <li>Identificación de detonantes y patrones de preocupación.</li>
            <li>Estrategias de regulación y exposición gradual cuando aplica.</li>
            <li>Seguimiento para sostener avances entre sesiones.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-online-ansiedad" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología online para ansiedad
            </Link>
            <Link to="/servicios" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver servicios
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}