import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineBogotaDueloFaq = buildFAQPageSchema([
  {
    question: '¿Puedo encontrar psicólogo online en Bogotá para duelo?',
    answer: 'Sí. Esta página está pensada para personas en Bogotá que necesitan acompañamiento online durante un duelo.',
  },
  {
    question: '¿Sirve si no quiero desplazarme?',
    answer: 'Sí. La modalidad online permite iniciar apoyo sin depender de traslados.',
  },
]);

export default function PsicologoOnlineBogotaDueloPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online en Bogotá para duelo | Basileia"
        description="Psicólogo online en Bogotá para duelo con acompañamiento respetuoso, acceso virtual y una ruta clara para empezar."
        canonicalPath="/psicologo-online-bogota-duelo"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineBogotaDueloFaq]}
      />

      <main className="route-shell route-psicologo-online-bogota-duelo">
        <section className="route-panel">
          <p className="eyebrow">Bogotá · Duelo</p>
          <h1>Psicólogo online en Bogotá para duelo con acompañamiento humano</h1>

          <p>
            Si buscas psicólogo online en Bogotá para duelo, aquí tienes una entrada pensada para empezar un proceso respetuoso y sin desplazarte.
          </p>

          <h2>Cuándo puede ayudar</h2>
          <ul>
            <li>Cuando necesitas hablar de la pérdida con calma y contención.</li>
            <li>Si el duelo ya está afectando tu rutina o tu descanso.</li>
            <li>Cuando quieres un espacio clínico que se adapte a tu momento.</li>
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