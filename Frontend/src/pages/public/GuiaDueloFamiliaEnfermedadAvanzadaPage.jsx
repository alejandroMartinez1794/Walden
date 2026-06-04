import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaDueloFamiliaFaq = buildFAQPageSchema([
  {
    question: '¿El duelo por enfermedad avanzada empieza antes del fallecimiento?',
    answer: 'Sí. Muchas familias empiezan a transitar pérdidas anticipadas mucho antes del desenlace, con cambios en roles y expectativas.',
  },
  {
    question: '¿Qué puede ayudar a la familia?',
    answer: 'Hablar claro, repartir tareas, sostener rutinas básicas y pedir apoyo psicológico cuando el peso emocional es demasiado alto.',
  },
]);

export default function GuiaDueloFamiliaEnfermedadAvanzadaPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Duelo en familia por enfermedad avanzada: guía práctica | Basileia"
        description="Guía para familias que viven duelo por enfermedad avanzada: pérdida anticipada, cambios de rol, autocuidado y cuándo buscar ayuda."
        canonicalPath="/guia-duelo-familia-enfermedad-avanzada"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaDueloFamiliaFaq]}
      />

      <main className="route-shell route-guia-duelo-familia-enfermedad-avanzada">
        <section className="route-panel">
          <p className="eyebrow">Guía familiar</p>
          <h1>Duelo en familia cuando la enfermedad avanzada ya cambió todo</h1>

          <p>
            En la enfermedad avanzada, la familia suele empezar a despedirse antes de tiempo. Nombrar ese proceso evita que cada uno lo cargue en silencio.
          </p>

          <h2>Qué se suele vivir</h2>
          <ul>
            <li>Tristeza y ansiedad por lo que viene.</li>
            <li>Conflictos sobre decisiones médicas o de cuidado.</li>
            <li>Culpa por cansarse, desconectarse o pedir ayuda.</li>
          </ul>

          <h2>Qué ayuda a la familia</h2>
          <ul>
            <li>Reunirse con un objetivo concreto, no solo para “hablar”.</li>
            <li>Dividir tareas visibles y descansar sin explicaciones de más.</li>
            <li>Buscar apoyo psicológico cuando el ambiente se vuelve tenso o muy triste.</li>
          </ul>

          <h2>Si necesitas una ruta clara</h2>
          <p>
            Puedes revisar nuestro <Link to="/duelo-anticipado">contenido de duelo anticipado</Link> o escribirnos desde <Link to="/contact">contacto</Link>.
          </p>
        </section>
      </main>
    </>
  );
}