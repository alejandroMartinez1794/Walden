import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const psicologiaVirtualFaq = buildFAQPageSchema([
  {
    question: '¿La psicología virtual funciona igual que la presencial?',
    answer: 'Para muchos procesos sí funciona muy bien, especialmente cuando hay buena conexión, privacidad y una estructura clara de sesión.',
  },
  {
    question: '¿Qué necesito para una sesión virtual?',
    answer: 'Un espacio privado, conexión estable, audífonos si es posible y disposición para hablar con calma durante el encuentro.',
  },
]);

export default function PsicologiaVirtualPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Psicología virtual | Basileia"
        description="Psicología virtual con sesiones seguras, atención clínica estructurada y acceso desde cualquier lugar de Colombia."
        canonicalPath="/psicologia-virtual"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), psicologiaVirtualFaq]}
      />

      <main className="route-shell route-psicologia-virtual">
        <section className="route-panel">
          <p className="eyebrow">Psicología virtual</p>
          <h1>Psicología virtual para quienes necesitan continuidad y acceso real</h1>

          <p>
            La psicología virtual permite sostener el proceso sin depender de desplazamientos largos o barreras geográficas. Es una opción útil para personas con agenda apretada, movilidad limitada o necesidad de mayor acceso.
          </p>

          <h2>Cuándo suele funcionar mejor</h2>
          <ul>
            <li>Cuando necesitas continuidad semanal o quincenal.</li>
            <li>Cuando te sientes más cómodo hablando desde un espacio conocido.</li>
            <li>Cuando vives en una ciudad o zona donde el acceso presencial es más limitado.</li>
          </ul>

          <h2>Qué cuidamos en la sesión</h2>
          <ul>
            <li>Privacidad y manejo responsable de la información.</li>
            <li>Una estructura clara para que no se sienta improvisada.</li>
            <li>Orientación clínica útil, no solo conversación abierta.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/psicologia-colombia" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver psicología en Colombia
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Agendar orientación
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}