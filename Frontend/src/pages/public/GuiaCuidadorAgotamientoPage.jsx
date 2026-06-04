import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaAgotamientoFaq = buildFAQPageSchema([
  {
    question: '¿Cómo sé si ya estoy muy agotado como cuidador?',
    answer: 'Cuando el cansancio ya afecta el sueño, la paciencia, la memoria o el deseo de seguir cuidando sin sentir alivio real.',
  },
  {
    question: '¿El agotamiento del cuidador es algo serio?',
    answer: 'Sí. Si se normaliza, puede terminar en ansiedad, depresión, errores en el cuidado y aislamiento emocional.',
  },
]);

export default function GuiaCuidadorAgotamientoPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Agotamiento del cuidador: señales y qué hacer | Basileia"
        description="Guía para reconocer el agotamiento del cuidador, poner límites, pedir ayuda y sostener el cuidado sin romper tu salud mental."
        canonicalPath="/guia-agotamiento-cuidador"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaAgotamientoFaq]}
      />

      <main className="route-shell route-guia-agotamiento-cuidador">
        <section className="route-panel">
          <p className="eyebrow">Guía para cuidadores</p>
          <h1>Agotamiento del cuidador: señales que no conviene pasar por alto</h1>

          <p>
            El agotamiento del cuidador no es falta de amor. Es una señal de que la carga superó la capacidad actual de sostenerla sin apoyo suficiente.
          </p>

          <h2>Señales frecuentes</h2>
          <ul>
            <li>Sueño alterado o cansancio persistente.</li>
            <li>Irritabilidad, culpa o sensación de estar al límite.</li>
            <li>Desconexión emocional o pérdida de interés por actividades propias.</li>
          </ul>

          <h2>Qué hacer</h2>
          <ul>
            <li>Pedir ayuda concreta, no general.</li>
            <li>Reducir tareas cuando sea posible y delegar sin culpa.</li>
            <li>Reservar espacios de descanso reales en la agenda.</li>
          </ul>

          <h2>Si ya no puedes más</h2>
          <p>
            Buscar apoyo psicológico no es exagerar; es una forma responsable de protegerte y sostener mejor el cuidado.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/cuidadores" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver recursos para cuidadores
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