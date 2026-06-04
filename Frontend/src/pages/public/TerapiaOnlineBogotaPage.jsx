import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const terapiaOnlineBogotaFaq = buildFAQPageSchema([
  {
    question: '¿La terapia online en Bogotá puede empezar rápido?',
    answer: 'Sí. La modalidad online suele facilitar el inicio rápido para quienes buscan atención desde Bogotá sin desplazarse.',
  },
  {
    question: '¿Sirve para ansiedad, depresión o duelo?',
    answer: 'Sí. Puede ser útil para motivos frecuentes como ansiedad, depresión, duelo y sobrecarga emocional.',
  },
]);

export default function TerapiaOnlineBogotaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Terapia online en Bogotá | Basileia"
        description="Terapia online en Bogotá con acceso sencillo, acompañamiento clínico y una puerta de entrada clara para empezar sin fricción."
        canonicalPath="/terapia-online-bogota"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), terapiaOnlineBogotaFaq]}
      />

      <main className="route-shell route-terapia-online-bogota">
        <section className="route-panel">
          <p className="eyebrow">Bogotá</p>
          <h1>Terapia online en Bogotá con acceso claro y continuidad clínica</h1>

          <p>
            Si estás buscando terapia online en Bogotá, esta ruta te ayuda a iniciar un proceso serio sin depender de desplazamientos.
          </p>

          <h2>Qué suele aportar</h2>
          <ul>
            <li>Inicio rápido y ordenado del proceso.</li>
            <li>Seguimiento clínico con objetivos concretos.</li>
            <li>Mayor facilidad para sostener la constancia.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologo-online-bogota" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicólogo online en Bogotá
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