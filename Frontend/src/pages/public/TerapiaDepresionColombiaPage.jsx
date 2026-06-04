import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const depresionColombiaFaq = buildFAQPageSchema([
  {
    question: '¿La terapia para depresión puede hacerse online?',
    answer: 'Sí. La terapia online puede ser una opción eficaz si hay un encuadre claro y una evaluación inicial adecuada.',
  },
  {
    question: '¿Qué tipo de ayuda ofrecen para depresión?',
    answer: 'Ofrecemos acompañamiento cognitivo-conductual orientado a cambiar patrones que sostienen el desánimo y a recuperar funcionamiento y bienestar.',
  },
]);

export default function TerapiaDepresionColombiaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia para depresión en Colombia | Basileia"
        description="Terapia para depresión en Colombia con atención virtual, orientación clínica y acceso responsable desde cualquier región del país."
        canonicalPath="/terapia-depresion-colombia"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), depresionColombiaFaq]}
      />

      <main className="route-shell route-terapia-depresion-colombia">
        <section className="route-panel">
          <p className="eyebrow">Depresión</p>
          <h1>Terapia para depresión en Colombia con acceso virtual y enfoque clínico</h1>

          <p>
            Buscar terapia para depresión en Colombia es dar un paso importante. En Basileia lo convertimos en un proceso claro, con orientación profesional y sin complicaciones innecesarias.
          </p>

          <h2>Qué puede ayudar</h2>
          <ul>
            <li>Comprender señales de desánimo, anhedonia y fatiga emocional.</li>
            <li>Reorganizar rutinas que la depresión suele desordenar.</li>
            <li>Recuperar pequeños avances sostenibles en la semana.</li>
          </ul>

          <h2>Si buscas ayuda ahora</h2>
          <p>
            Puedes revisar nuestros <Link to="/depresion">recursos sobre depresión</Link> o escribir desde <Link to="/contact">contacto</Link> para orientación inicial.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-en-linea" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología en línea
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