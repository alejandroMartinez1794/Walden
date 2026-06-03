import React from 'react';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué entendemos por enfermedades limitantes para la vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son condiciones sin cura con riesgo de muerte prematura donde el acompañamiento psicológico es esencial durante meses o años (ej. cáncer avanzado, ELA, fallas orgánicas severas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué apoyo ofrecemos a pacientes y cuidadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Acompañamiento psicoterapéutico, manejo del duelo anticipado, psicoeducación sobre síntomas y apoyo específico para cuidadores y familias.',
      },
    },
  ],
};

export default function EnfermedadesCronicasPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Enfermedades crónicas avanzadas y condiciones limitantes para la vida | Basileia"
        description="Acompañamiento psicológico para personas con enfermedades crónicas avanzadas, hemato-oncológicas y neurodegenerativas, y apoyo especializado a sus cuidadores."
        canonicalPath="/enfermedades-cronicas"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: 'Basileia',
            url: 'https://basileia.tech',
            medicalSpecialty: ['Psychology', 'PalliativeCare', 'Psycho-oncology'],
          },
          FAQ,
        ]}
      />
      <main className="route-shell route-enfermedades-cronicas">
        <section className="route-panel">
          <p className="eyebrow">Enfermedades Crónicas</p>
          <h1>Acompañamiento en enfermedades crónicas, avanzadas o limitantes para la vida</h1>

          <p>Vivir con una enfermedad crónica avanzada o limitante para la vida plantea desafíos clínicos, emocionales y sociales que afectan tanto al paciente como a su familia. En Basileia brindamos acompañamiento psicológico especializado, centrado en mejorar la calidad de vida, reducir la carga emocional y fortalecer las redes de apoyo, con especial experiencia en cáncer avanzado, enfermedades hemato-oncológicas y neurodegenerativas como ELA o Esclerosis Múltiple.</p>

          <h2>¿Qué entendemos por «enfermedad limitante para la vida»?</h2>
          <p>Es un término clínico que describe condiciones sin cura con mayor probabilidad de muerte prematura, pero en las que el paciente puede vivir meses o años requiriendo apoyo continuo. Preferimos este marco porque evita la estigmatización temprana y permite intervenciones terapéuticas tempranas y sostenidas.</p>

          <h2>¿A quién acompañamos?</h2>
          <p>Nuestro servicio está dirigido a:</p>
          <ul>
            <li>Personas con diagnósticos hemato-oncológicos en fases avanzadas.</li>
            <li>Pacientes con enfermedades neurodegenerativas (p. ej. ELA, Esclerosis Múltiple, Alzheimer) que generan pérdida funcional progresiva.</li>
            <li>Quienes viven con fallas orgánicas crónicas o condiciones complejas que necesitan soporte psicológico permanente.</li>
            <li>Familias y cuidadores que requieren orientación práctica y soporte emocional para sostener el cuidado.</li>
          </ul>

          <h2>Objetivos del acompañamiento psicológico</h2>
          <p>Nuestros objetivos terapéuticos están orientados a:</p>
          <ul>
            <li>Reducir la ansiedad relacionada con el diagnóstico y el tratamiento.</li>
            <li>Mejorar el afrontamiento frente al dolor, la fatiga y la incertidumbre.</li>
            <li>Trabajar procesos de duelo anticipado y adaptación emocional a cambios funcionales.</li>
            <li>Fortalecer las competencias de los cuidadores y su capacidad de autocuidado.</li>
          </ul>

          <h2>Intervenciones que ofrecemos</h2>
          <p>Combinamos intervenciones breves y focales con estrategias a medio plazo, según las necesidades:</p>
          <ol>
            <li><strong>Evaluación clínica inicial</strong>: diagnóstico psicoemocional, objetivos y plan de intervención.</li>
            <li><strong>Terapia adaptada</strong>: TCC adaptada, intervenciones de manejo del estrés y apoyo para la adherencia a tratamientos médicos.</li>
            <li><strong>Psicoeducación</strong>: información clara sobre síntomas, efectos secundarios y señales de alarma.</li>
            <li><strong>Soporte para cuidadores</strong>: sesiones de orientación práctica, planificación de descansos y manejo del agotamiento.</li>
            <li><strong>Acompañamiento en duelo</strong>: espacios seguros para procesar pérdidas anticipadas y transformar ambivalencias complejas.</li>
          </ol>

          <h2>Casos prácticos y ejemplos</h2>
          <p>En pacientes con cáncer avanzado, trabajamos técnicas para disminuir la activación ante noticias médicas, mejorar la comunicación con el equipo de salud y ayudar en la toma de decisiones. En enfermedades como ELA o Esclerosis Múltiple, enfocamos la intervención en la adaptación a la pérdida funcional, estrategias de comunicación con la familia y planificación de necesidades futuras.</p>

          <h2>Apoyo específico para cuidadores</h2>
          <p>Reconocemos que el bienestar del cuidador es crítico para la sostenibilidad del cuidado. Ofrecemos:</p>
          <ul>
            <li>Sesiones focales para manejo del estrés y la fatiga.</li>
            <li>Planificación de descansos y compartición de tareas.</li>
            <li>Herramientas prácticas para coordinar citas médicas y trámites.</li>
            <li>Apoyo emocional ante el duelo anticipado y la adaptación a nuevas responsabilidades.</li>
          </ul>

          <h2>Opciones de presentación profesional (para perfiles y portafolios)</h2>
          <h3>Opción A — Centrada en la especialidad</h3>
          <p>Brindo acompañamiento psicoterapéutico y soporte emocional a pacientes diagnosticados con enfermedades hemato-oncológicas, crónicas avanzadas y condiciones limitantes para la vida (como la Esclerosis Lateral Amiotrófica - ELA), así como apoyo integral a sus familias y cuidadores.</p>

          <h3>Opción B — Centrada en el proceso</h3>
          <p>Especializado en el apoyo psicológico para personas que transitan por enfermedades de alta complejidad, condiciones neurodegenerativas y procesos de fin de vida, ofreciendo un espacio de contención, procesamiento del duelo anticipado y adaptación al impacto del diagnóstico.</p>

          <h2>Preguntas frecuentes</h2>
          <h3>¿Puedo recibir terapia durante el tratamiento oncológico?</h3>
          <p>Sí. La psicooncología está diseñada para acompañar procesos de tratamiento, manejo del dolor y la incertidumbre. Trabajamos en coordinación con equipos médicos cuando el paciente lo autoriza.</p>

          <h3>¿Cómo se articula la terapia con otros servicios médicos?</h3>
          <p>Con el consentimiento del paciente, coordinamos información relevante con el equipo médico para ofrecer apoyo integral y coherente con el plan sanitario.</p>

          <h2>Cómo acceder</h2>
          <p>Para solicitar una primera consulta revisa nuestros <a href="/servicios">servicios</a> o <a href="/contact">contáctanos</a>. Ofrecemos modalidades en línea para personas con movilidad limitada y adaptamos horarios según necesidades.</p>

          <h2>Llamada a la acción</h2>
          <p>Si necesitas acompañamiento para ti o un ser querido con una enfermedad crónica avanzada, agenda una consulta inicial con nuestro equipo. <a href="/contact">Contactar con Basileia</a>.</p>

        </section>
      </main>
    </>
  );
}
