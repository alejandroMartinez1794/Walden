import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaDueloFaq = buildFAQPageSchema([
  {
    question: '¿Cómo sé si estoy viviendo duelo anticipado?',
    answer: 'Suele aparecer cuando ya hay una pérdida esperada y empiezas a sentir tristeza, miedo, culpa o agotamiento antes de que ocurra.',
  },
  {
    question: '¿Ayuda hablar de ello con la familia?',
    answer: 'Sí. Nombrar lo que pasa reduce malentendidos y facilita repartir tareas, pedir apoyo y tomar decisiones con menos aislamiento emocional.',
  },
]);

export default function GuiaDueloAnticipadoPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Señales de duelo anticipado y qué hacer | Basileia"
        description="Guía para reconocer duelo anticipado: señales emocionales, estrategias de afrontamiento y cuándo buscar apoyo psicológico."
        canonicalPath="/guia-duelo-anticipado"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaDueloFaq]}
      />

      <main className="route-shell route-guia-duelo-anticipado">
        <section className="route-panel">
          <p className="eyebrow">Guía informativa</p>
          <h1>Señales de duelo anticipado que conviene reconocer a tiempo</h1>

          <p>
            El duelo anticipado no es debilidad ni exageración. Es una respuesta humana a una pérdida que se ve venir y que ya está afectando la vida diaria.
          </p>

          <h2>Señales frecuentes</h2>
          <ul>
            <li>Tristeza intermitente o constante.</li>
            <li>Ansiedad al pensar en el futuro.</li>
            <li>Culpa por descansar o por no hacer “más”.</li>
            <li>Dificultad para concentrarse o dormir.</li>
          </ul>

          <h2>Qué puede ayudar</h2>
          <ul>
            <li>Hablar de lo que viene sin forzar respuestas.</li>
            <li>Separar momentos de cuidado y momentos de descanso.</li>
            <li>Buscar apoyo psicológico para ordenar emociones y decisiones.</li>
          </ul>

          <h2>Cuándo pedir ayuda</h2>
          <p>
            Si el malestar ya está afectando el sueño, el trabajo o la relación con la persona enferma, conviene pedir apoyo cuanto antes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/duelo-anticipado" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver página de duelo anticipado
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