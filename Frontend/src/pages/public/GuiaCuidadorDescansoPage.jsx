import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const guiaDescansoFaq = buildFAQPageSchema([
  {
    question: '¿Por qué el descanso del cuidador es parte del cuidado?',
    answer: 'Porque sin descanso sostenido el cuidador se agota, se irrita más fácil y pierde capacidad de sostener decisiones y rutinas con claridad.',
  },
  {
    question: '¿Qué tipo de descanso sirve más?',
    answer: 'El que sea realista y repetible: pausas cortas, turnos, sueño protegido y momentos propios fuera del rol de cuidado.',
  },
]);

export default function GuiaCuidadorDescansoPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Descanso del cuidador: por qué importa y cómo sostenerlo | Basileia"
        description="Guía práctica sobre descanso del cuidador: por qué es esencial, qué rutinas ayudan y cómo evitar el desgaste emocional sostenido."
        canonicalPath="/guia-descanso-cuidador"
        schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), guiaDescansoFaq]}
      />

      <main className="route-shell route-guia-descanso-cuidador">
        <section className="route-panel">
          <p className="eyebrow">Guía para cuidadores</p>
          <h1>El descanso del cuidador no es un lujo: es parte del tratamiento del día a día</h1>

          <p>
            Cuidar de forma continua sin pausas crea una falsa sensación de responsabilidad. En realidad, descansar es una forma de cuidar mejor.
          </p>

          <h2>Qué puede ayudar</h2>
          <ul>
            <li>Bloques pequeños de descanso en vez de esperar una gran pausa inexistente.</li>
            <li>Turnos de cuidado definidos con otra persona.</li>
            <li>Rutinas simples de sueño, comida y movimiento.</li>
          </ul>

          <h2>Qué suele sabotear el descanso</h2>
          <ul>
            <li>Sentir culpa por alejarse aunque sea un rato.</li>
            <li>Responder a todo en automático.</li>
            <li>Creer que pedir ayuda “molesta” a los demás.</li>
          </ul>

          <h2>Si ya estás agotado</h2>
          <p>
            La señal no es que te falte voluntad; la señal es que necesitas reorganizar el cuidado y, probablemente, apoyo psicológico.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/guia-agotamiento-cuidador" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver agotamiento del cuidador
            </Link>
            <Link to="/cuidadores" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Ver página de cuidadores
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}