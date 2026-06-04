import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologiaEnLineaFaq = buildFAQPageSchema([
  {
    question: '¿Qué significa psicología en línea?',
    answer: 'Significa atención psicológica por internet, generalmente en videollamada, con un encuadre clínico y un objetivo terapéutico claro.',
  },
  {
    question: '¿Es segura la psicología en línea?',
    answer: 'Puede serlo si hay una plataforma confiable, privacidad en el espacio y un manejo responsable de la información personal.',
  },
]);

export default function PsicologiaEnLineaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicología en línea | Basileia"
        description="Psicología en línea con atención clínica por videollamada, acceso responsable y acompañamiento profesional en Colombia."
        canonicalPath="/psicologia-en-linea"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologiaEnLineaFaq]}
      />

      <main className="route-shell route-psicologia-en-linea">
        <section className="route-panel">
          <p className="eyebrow">Psicología en línea</p>
          <h1>Psicología en línea con un proceso claro desde la primera sesión</h1>

          <p>
            La psicología en línea no debería sentirse genérica ni fría. Bien hecha, ofrece una experiencia clínica cuidada, accesible y fácil de sostener en el tiempo.
          </p>

          <h2>Qué puede esperar el usuario</h2>
          <ul>
            <li>Encuadre claro de horarios, objetivos y seguimiento.</li>
            <li>Atención a ansiedad, depresión, duelo, crisis y otros motivos comunes.</li>
            <li>Orientación práctica para convertir la consulta en avance real.</li>
          </ul>

          <h2>Para quién es especialmente útil</h2>
          <p>
            Para personas que quieren psicología en línea sin depender de ubicación, tráfico o agendas imposibles, y que además quieren un acompañamiento clínico serio.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-virtual" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología virtual
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