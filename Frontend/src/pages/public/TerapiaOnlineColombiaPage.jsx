import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const terapiaOnlineColombiaFaq = buildFAQPageSchema([
  {
    question: '¿La terapia online en Colombia puede ser útil para ansiedad o depresión?',
    answer: 'Sí. La terapia online puede ser una muy buena puerta de entrada para ansiedad, depresión, duelo y otros motivos frecuentes.',
  },
  {
    question: '¿Qué necesito para comenzar?',
    answer: 'Un espacio privado, conexión estable y disposición para sostener un proceso con objetivos claros.',
  },
]);

export default function TerapiaOnlineColombiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia online en Colombia | Basileia"
        description="Terapia online en Colombia con acompañamiento clínico, acceso sencillo y enfoque útil para distintos motivos de consulta."
        canonicalPath="/terapia-online-colombia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), terapiaOnlineColombiaFaq]}
      />

      <main className="route-shell route-terapia-online-colombia">
        <section className="route-panel">
          <p className="eyebrow">Terapia online</p>
          <h1>Terapia online en Colombia con acceso simple y criterio clínico</h1>

          <p>
            La terapia online en Colombia es una alternativa sólida cuando necesitas iniciar pronto, sostener el proceso y evitar barreras de traslado.
          </p>

          <h2>Motivos de consulta frecuentes</h2>
          <ul>
            <li>Ansiedad y estrés.</li>
            <li>Depresión y desánimo persistente.</li>
            <li>Duelo, crisis y sobrecarga emocional.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/servicios" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver servicios
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