import { Link } from 'react-router-dom';
import { services } from '../assets/data/services';
import ServiceCard from '../components/Services/servicecard';
import ClinicalSeoHead from '../components/ClinicalSeoHead';
import { buildFAQPageSchema, buildMedicalOrganizationSchema, PUBLIC_CLINICAL_ORGANIZATION } from '../seo/medical-schema';

const servicesFaq = buildFAQPageSchema([
    {
        question: '¿Cómo se estructura una primera cita?',
        answer: 'La primera cita se enfoca en evaluación, claridad de objetivos y definición de un plan de intervención según tus necesidades y ritmo.',
    },
    {
        question: '¿Atienden ansiedad, depresión y duelo?',
        answer: 'Sí. Nuestro enfoque clínico incluye acompañamiento para ansiedad, depresión, crisis, duelo y apoyo a cuidadores o familias.',
    },
]);

const Services   = () => {
    return (
        <>
            <ClinicalSeoHead
                title="Servicios psicológicos | Basileia"
                description="Servicios psicológicos en línea con enfoque cognitivo-conductual, atención ética, transparencia y acceso público en Colombia. Psicología virtual, psicología en línea y apoyo clínico para distintos motivos de consulta."
                canonicalPath="/servicios"
                schema={[buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION), servicesFaq]}
            />
            <section>
                <div className="container">
                    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link to="/psicologia-colombia" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Búsqueda amplia</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicología en Colombia</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Encuentra a Basileia cuando busques un servicio psicológico serio y accesible en el país.</p>
                            </Link>
                            <Link to="/psicologia-virtual" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acceso remoto</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicología virtual</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Sesiones seguras y estructuradas para quienes necesitan continuidad sin desplazarse.</p>
                            </Link>
                            <Link to="/psicologia-en-linea" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Sesión por videollamada</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicología en línea</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Una forma clara de iniciar terapia online con acompañamiento clínico real.</p>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link to="/psicologo-bogota" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo en Bogotá</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Para personas que buscan un psicólogo en Bogotá con acceso virtual y continuidad clínica.</p>
                            </Link>
                            <Link to="/psicologo-online-bogota" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Bogotá</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Captura búsquedas de atención online desde Bogotá con una ruta directa.</p>
                            </Link>
                            <Link to="/psicologo-online-bogota-ansiedad" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Bogotá para ansiedad</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Ruta específica para búsquedas de ansiedad con foco local en Bogotá.</p>
                            </Link>
                            <Link to="/psicologo-online-bogota-duelo" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Bogotá para duelo</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Variante respetuosa para búsquedas de duelo en Bogotá.</p>
                            </Link>
                            <Link to="/terapia-online-bogota" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia online en Bogotá</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Ruta específica para búsquedas de terapia online desde Bogotá.</p>
                            </Link>
                            <Link to="/terapia-online-bogota-depresion" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Local</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia online en Bogotá para depresión</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Variante orientada a búsquedas de depresión dentro de Bogotá.</p>
                            </Link>
                            <Link to="/psicologia-online-ansiedad" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicología online para ansiedad</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Búsqueda directa para quienes necesitan empezar terapia online por ansiedad.</p>
                            </Link>
                            <Link to="/psicologia-online-depresion" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicología online para depresión</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Nueva entrada para búsquedas de ayuda online por depresión.</p>
                            </Link>
                            <Link to="/terapia-online-depresion" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Terapia</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia online para depresión</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Captura búsquedas de terapia online por depresión con una puerta de entrada clara.</p>
                            </Link>
                            <Link to="/terapia-depresion-colombia" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia para depresión en Colombia</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Ruta clara para personas que buscan atención por depresión en el país.</p>
                            </Link>
                            <Link to="/psicologo-online-duelo" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Duelo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online para duelo</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Atención online para procesos de pérdida con acompañamiento respetuoso.</p>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link to="/psicologo-virtual-colombia" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Virtual</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo virtual en Colombia</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Atención virtual con acceso desde cualquier región del país.</p>
                            </Link>
                            <Link to="/psicologo-online-colombia" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Online</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Colombia</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Ruta directa para búsquedas comerciales de atención online.</p>
                            </Link>
                            <Link to="/psicologo-online-colombia-ansiedad" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Colombia para ansiedad</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Entrada nacional para búsquedas de ansiedad en formato online.</p>
                            </Link>
                            <Link to="/psicologo-online-colombia-duelo" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivo</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online en Colombia para duelo</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Variante para búsquedas de duelo con alcance nacional.</p>
                            </Link>
                            <Link to="/terapia-online-colombia" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Terapia</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia online en Colombia</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Entrada comercial para usuarios listos para empezar terapia.</p>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link to="/psicologo-online-ansiedad" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Ansiedad</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo online para ansiedad</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Variante comercial para captar búsquedas de ayuda online por ansiedad.</p>
                            </Link>
                            <Link to="/psicologo-virtual-depresion" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Depresión</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Psicólogo virtual para depresión</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Otra entrada enfocada en depresión con atención virtual.</p>
                            </Link>
                            <Link to="/terapia-online-ansiedad" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Terapia</p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">Terapia online para ansiedad</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-700">Ruta directa para usuarios listos para empezar tratamiento.</p>
                            </Link>
                        </div>
                    </div>

                    <div className="xl:w-[470px] mx-auto text-center mb-12">
                        <h2 className="heading">🧠 Nuestros servicios psicológicos</h2>
                        <p className="text_para mt-2">
                            Desde un enfoque cognitivo-conductual, abordamos los desafíos emocionales y mentales con herramientas clínicas respaldadas por la evidencia y adaptadas a tu contexto. Cada proceso terapéutico se diseña teniendo en cuenta la historia, el ritmo y las necesidades únicas de la persona. De este modo promovemos cambios reales, sostenibles y con sentido.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] ">
                        {services.map((item, index) => (
                        <ServiceCard item={item} index={index} key={index} /> 
                    ))}
                    </div>
                </div>
            </section>
        </>  
    )
}

export default Services;
