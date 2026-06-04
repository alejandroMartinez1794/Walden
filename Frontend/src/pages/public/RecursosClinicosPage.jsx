import React from 'react';
import { Link } from 'react-router-dom';
import ClinicalSeoHead from '../../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, buildWebSiteSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../../seo/medical-schema';

const recursosFaq = buildFAQPageSchema([
  {
    question: '¿Qué tipo de contenidos reúne este centro de recursos?',
    answer: 'Agrupa guías públicas sobre ansiedad, depresión, duelo, cuidadores, ELA, psicooncología y crisis para facilitar la navegación y el descubrimiento en buscadores.',
  },
  {
    question: '¿Para quién está pensado?',
    answer: 'Para pacientes, familiares, cuidadores y personas que buscan información psicológica confiable antes de pedir una consulta.',
  },
]);

export default function RecursosClinicosPage() {
  return (
    <>
      <ClinicalSeoHead
        title="Centro de recursos clínicos | Basileia"
        description="Centro de recursos clínicos con guías públicas sobre ansiedad, depresión, duelo, cuidadores, ELA y psicooncología."
        canonicalPath="/recursos-clinicos"
        schema={[
          buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION),
          buildWebSiteSchema({
            name: 'Basileia',
            url: 'https://basileia.tech',
            description: 'Centro público de recursos clínicos y telepsicología en Colombia.',
          }),
          recursosFaq,
        ]}
      />

      <main className="route-shell route-recursos-clinicos">
        <section className="route-panel">
          <p className="eyebrow">Centro de recursos</p>
          <h1>Guías públicas para encontrar ayuda psicológica más rápido</h1>

          <p>
            Este centro reúne las piezas más útiles para búsquedas informacionales y de apoyo emocional. La idea es simple: que una persona llegue, entienda qué necesita y dé el siguiente paso sin perderse.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link to="/psicologo-bogota" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo en Bogotá</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Una ruta local para personas que buscan atención psicológica en la capital.</p>
            </Link>
            <Link to="/psicologo-online-bogota" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Bogotá</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Entrada directa para búsquedas de atención online desde Bogotá.</p>
            </Link>
            <Link to="/psicologo-online-bogota-ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Bogotá para ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Ruta específica para atención online por ansiedad en Bogotá.</p>
            </Link>
            <Link to="/psicologo-online-bogota-duelo" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Bogotá para duelo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acompañamiento online en Bogotá para procesos de pérdida.</p>
            </Link>
            <Link to="/terapia-online-bogota" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Terapia online en Bogotá</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Opción directa para usuarios que buscan empezar terapia online en la ciudad.</p>
            </Link>
            <Link to="/terapia-online-bogota-depresion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Terapia online en Bogotá para depresión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Variante local para búsquedas de depresión con atención virtual.</p>
            </Link>
            <Link to="/psicologo-virtual-colombia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo virtual en Colombia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acceso virtual desde cualquier ciudad con continuidad clínica.</p>
            </Link>
            <Link to="/psicologo-online-colombia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Colombia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Entrada clara para búsquedas comerciales de atención online.</p>
            </Link>
            <Link to="/psicologo-online-colombia-ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Colombia para ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Entrada nacional para búsquedas de psicólogos online enfocados en ansiedad.</p>
            </Link>
            <Link to="/psicologo-online-colombia-duelo" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online en Colombia para duelo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Ruta nacional de apoyo online para procesos de pérdida.</p>
            </Link>
            <Link to="/psicologo-online-ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online para ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Variante más comercial para quien busca ayuda por ansiedad.</p>
            </Link>
            <Link to="/psicologo-virtual-depresion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo virtual para depresión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Otra entrada pensada para búsquedas de depresión con acceso virtual.</p>
            </Link>
            <Link to="/psicologia-online-ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicología online para ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Ideal para quien quiere empezar terapia por ansiedad en formato online.</p>
            </Link>
            <Link to="/psicologia-online-depresion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicología online para depresión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Otra vía para captar búsquedas por depresión con atención online.</p>
            </Link>
            <Link to="/terapia-online-depresion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Terapia online para depresión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Una entrada transaccional para usuarios listos para iniciar terapia online por depresión.</p>
            </Link>
            <Link to="/psicologo-online-duelo" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Psicólogo online para duelo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acompañamiento respetuoso en procesos de pérdida sin necesidad de desplazarte.</p>
            </Link>
            <Link to="/terapia-depresion-colombia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Terapia para depresión en Colombia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acceso público y claro para búsquedas de apoyo por depresión.</p>
            </Link>
            <Link to="/terapia-online-ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Terapia online para ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Entrada directa para usuarios listos para iniciar tratamiento online.</p>
            </Link>
            <Link to="/terapia-online-colombia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Terapia online en Colombia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Opción directa para usuarios que buscan empezar terapia online sin fricción.</p>
            </Link>
            <Link to="/psicologia-colombia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:col-span-2">
              <h2 className="text-xl font-bold text-slate-950">Psicología en Colombia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">La puerta de entrada para búsquedas amplias sobre atención psicológica en el país.</p>
            </Link>
            <Link to="/psicologia-virtual" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicología virtual</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Sesiones remotas con estructura clínica y acceso desde cualquier lugar.</p>
            </Link>
            <Link to="/psicologia-en-linea" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicología en línea</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Terapia online con una experiencia clara y orientada a resultados.</p>
            </Link>
            <Link to="/guia-agotamiento-cuidador" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Agotamiento del cuidador</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Señales, límites y qué hacer cuando cuidar ya está drenando demasiado.</p>
            </Link>
            <Link to="/guia-ela-comunicacion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Cómo hablar de ELA en familia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Comunicación, roles y manejo de conversaciones difíciles.</p>
            </Link>
            <Link to="/guia-psicooncologia-cuidadores" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicooncología para cuidadores</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Cómo sostener el proceso oncológico sin desbordarte.</p>
            </Link>
            <Link to="/guia-duelo-familia-enfermedad-avanzada" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Duelo familiar por enfermedad avanzada</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Qué pasa en la familia cuando la pérdida empieza antes.</p>
            </Link>
            <Link to="/guia-descanso-cuidador" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Descanso del cuidador</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Por qué descansar no te aleja del cuidado, sino que lo hace sostenible.</p>
            </Link>
            <Link to="/guia-ela-cuidadores" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Guía ELA para cuidadores</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Qué hacer, qué vigilar y cómo sostener el cuidado sin desbordarte.</p>
            </Link>
            <Link to="/guia-duelo-anticipado" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Señales de duelo anticipado</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Reconocer el malestar temprano y pedir apoyo con más claridad.</p>
            </Link>
            <Link to="/guia-psicooncologia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicooncología: qué es</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Entender cómo ayuda antes, durante y después del tratamiento oncológico.</p>
            </Link>
            <Link to="/ansiedad" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Ansiedad</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Técnicas inmediatas, señales de alarma y cuándo pedir ayuda.</p>
            </Link>
            <Link to="/depresion" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Depresión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Señales frecuentes, primeros pasos y orientación para buscar apoyo.</p>
            </Link>
            <Link to="/duelo" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Duelo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Recursos para sostener una pérdida y cuándo conviene acompañamiento clínico.</p>
            </Link>
            <Link to="/duelo-anticipado" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Duelo anticipado</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Qué sentir, qué hacer y cómo pedir apoyo antes de una pérdida esperada.</p>
            </Link>
            <Link to="/cuidadores" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Cuidadores</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Autocuidado, carga emocional y apoyo para sostener el rol de cuidado.</p>
            </Link>
            <Link to="/ela" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">ELA</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acompañamiento para pacientes, familias y cuidadores en ELA.</p>
            </Link>
            <Link to="/psicooncologia" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Psicooncología</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acompañamiento psicológico en cáncer avanzado y tratamiento oncológico.</p>
            </Link>
            <Link to="/crisis" className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Crisis</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">Acceso inmediato a recursos de emergencia y contención segura.</p>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/servicios" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Ver servicios
            </Link>
            <Link to="/contact" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
              Contactar
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}