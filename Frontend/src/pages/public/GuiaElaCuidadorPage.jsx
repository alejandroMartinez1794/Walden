import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaElaFaq = buildFAQPageSchema([
  {
    question: '¿Qué necesita un cuidador de una persona con ELA?',
    answer: 'Información clara, descanso programado, apoyo emocional y una distribución realista de tareas para evitar la sobrecarga sostenida.',
  },
  {
    question: '¿Cuándo buscar apoyo psicológico?',
    answer: 'Cuando el cansancio, la culpa, el insomnio o la irritabilidad se vuelven frecuentes y ya afectan la calidad del cuidado y la vida personal.',
  },
]);

export default function GuiaElaCuidadorPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Cómo cuidar a una persona con ELA: guía para cuidadores | Basileia"
        description="Guía práctica para cuidadores de personas con ELA: carga emocional, organización del cuidado, señales de sobrecarga y cuándo pedir ayuda."
        canonicalPath="/guia-ela-cuidadores"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaElaFaq]}
      />

      <main className="route-shell route-guia-ela-cuidadores">
        <section className="route-panel">
          <p className="eyebrow">Guía para cuidadores</p>
          <h1>Cómo cuidar a una persona con ELA sin romperte en el intento</h1>

          <p>
            Cuidar a alguien con ELA exige presencia, coordinación y mucha energía emocional. Esta guía resume lo más importante para sostener el cuidado sin normalizar el agotamiento.
          </p>

          <h2>Lo primero es ordenar el cuidado</h2>
          <ul>
            <li>Define tareas fijas y tareas que se puedan delegar.</li>
            <li>Usa una lista simple de medicamentos, citas y contactos útiles.</li>
            <li>Agenda pausas reales, no solo “si sobra tiempo”.</li>
          </ul>

          <h2>Señales de alerta en el cuidador</h2>
          <ul>
            <li>Insomnio persistente o cansancio que no mejora.</li>
            <li>Llanto frecuente, irritabilidad o sensación de vacío.</li>
            <li>Desconexión, culpa excesiva o pensamientos de no poder más.</li>
          </ul>

          <h2>Qué ayuda de verdad</h2>
          <p>
            Hablar con otros cuidadores, pedir apoyo psicológico y aceptar ayuda práctica suele ser más útil que intentar hacerlo todo solo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/cuidadores" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver recursos para cuidadores
            </Link>
            <Link to="/ela" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver página ELA
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}