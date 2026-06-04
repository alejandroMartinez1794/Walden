import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const anticipatoryGriefFaq = buildFAQPageSchema([
  {
    question: '¿Qué es el duelo anticipado?',
    answer: 'Es el proceso emocional que aparece antes de una pérdida esperada, por ejemplo ante una enfermedad avanzada o cambios funcionales progresivos.',
  },
  {
    question: '¿Cuándo buscar ayuda psicológica?',
    answer: 'Cuando la tristeza, la culpa, la ansiedad o la sobrecarga interfieren con el sueño, el funcionamiento diario o la comunicación con la familia.',
  },
]);

export default function DueloAnticipadoPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Duelo anticipado: apoyo psicológico antes de una pérdida esperada | Basileia"
        description="Guía pública sobre duelo anticipado: qué es, cómo se vive, qué señales de sobrecarga observar y cuándo buscar acompañamiento psicológico."
        canonicalPath="/duelo-anticipado"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), anticipatoryGriefFaq]}
      />

      <main className="route-shell route-duelo-anticipado">
        <section className="route-panel">
          <p className="eyebrow">Duelo anticipado</p>
          <h1>Entender y acompañar el duelo anticipado con claridad</h1>

          <p>
            El duelo anticipado aparece cuando una pérdida se ve venir. Puede surgir en enfermedades avanzadas, deterioro progresivo o cambios importantes en la autonomía. Nombrarlo ayuda a pedir ayuda antes de que el agotamiento se vuelva total.
          </p>

          <h2>Qué puede sentirse</h2>
          <ul>
            <li>Tristeza, miedo o culpa por lo que viene.</li>
            <li>Rabia, cansancio emocional o dificultad para concentrarse.</li>
            <li>Ambivalencia entre querer seguir acompañando y necesitar descansar.</li>
          </ul>

          <h2>Qué suele ayudar</h2>
          <ul>
            <li>Hablar con alguien de confianza sin minimizar lo que pasa.</li>
            <li>Definir rutinas simples para dormir, comer y descansar.</li>
            <li>Dividir tareas para que el cuidado no caiga sobre una sola persona.</li>
            <li>Buscar apoyo psicológico para ordenar emociones y decisiones.</li>
          </ul>

          <h2>Si necesitas un siguiente paso</h2>
          <p>
            Puedes revisar nuestros <Link to="/servicios">servicios</Link> o escribirnos desde la <Link to="/contact">página de contacto</Link> para una orientación inicial.
          </p>
        </section>
      </main>
    </>
  );
}