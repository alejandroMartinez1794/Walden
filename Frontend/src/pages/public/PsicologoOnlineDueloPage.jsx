import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologoOnlineDueloFaq = buildFAQPageSchema([
  {
    question: '¿Un psicólogo online puede acompañar un duelo?',
    answer: 'Sí. Puede ayudar a sostener el proceso, poner en palabras lo que pasa y cuidar el funcionamiento diario mientras atraviesas la pérdida.',
  },
  {
    question: '¿Es normal necesitar ayuda profesional durante el duelo?',
    answer: 'Sí. Buscar apoyo no significa que el duelo esté mal; a veces solo necesitas un espacio seguro para transitarlo.',
  },
]);

export default function PsicologoOnlineDueloPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicólogo online para duelo | Basileia"
        description="Psicólogo online para duelo con acompañamiento clínico, acceso desde Colombia y apoyo respetuoso en procesos de pérdida."
        canonicalPath="/psicologo-online-duelo"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologoOnlineDueloFaq]}
      />

      <main className="route-shell route-psicologo-online-duelo">
        <section className="route-panel">
          <p className="eyebrow">Duelo</p>
          <h1>Psicólogo online para duelo con acompañamiento respetuoso y humano</h1>

          <p>
            Si buscas un psicólogo online para duelo, esta página te ofrece una puerta de entrada simple para pedir ayuda sin desplazarte.
          </p>

          <h2>Cuándo puede servir</h2>
          <ul>
            <li>Cuando la tristeza ya está afectando sueño, apetito o trabajo.</li>
            <li>Si necesitas un espacio para hablar de la pérdida con más calma.</li>
            <li>Cuando quieres sostenerte mientras te adaptas a una ausencia importante.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/duelo" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver recursos de duelo
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