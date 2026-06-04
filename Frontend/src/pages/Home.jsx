import React from "react";
import heroImg01 from "../assets/images/hero-img01.png";
import heroImg02 from "../assets/images/hero-img02.png";
import heroImg03 from "../assets/images/hero-img03.png";
import icon01 from "../assets/images/icon01.png";
import icon02 from "../assets/images/icon02.png";
import icon03 from "../assets/images/icon03.png";
import featureimg from "../assets/images/feature-img.png";
import faqimg from "../assets/images/faq-img.png";
import videoIcon from "../assets/images/video-icon.png";
import avatarIcon from "../assets/images/avatar-icon.png"
import { Link } from "react-router-dom";
import About from "../components/About/About";
import ServiceList from "../components/Services/ServiceList";
import Faqlist from "../components/faq/Faqlist";
import Testimonial from "../components/Testimonial/testimonial";
import ClinicalSeoHead from "../components/ClinicalSeoHead";
import { buildFAQPageSchema, buildMedicalOrganizationSchema, buildWebSiteSchema, PUBLIC_CLINICAL_ORGANIZATION } from "../seo/medical-schema";

const homeFaq = buildFAQPageSchema([
    {
        question: '¿Qué tipo de atención ofrece Basileia?',
        answer: 'Ofrecemos telepsicología clínica con enfoque cognitivo-conductual, acompañamiento responsable y recursos públicos para crisis, ansiedad, depresión, duelo y cuidadores.',
    },
    {
        question: '¿Puedo empezar sin una cuenta o sin tener experiencia previa en terapia?',
        answer: 'Sí. El sitio está pensado para acceso público, con orientación clara y rutas directas para conocer servicios, pedir contacto y revisar recursos iniciales.',
    },
]);


const Home = () => {
    return (
        <>
            <ClinicalSeoHead
                title="Basileia | Telepsicología clínica en Colombia"
                description="Atención psicológica en línea con enfoque clínico, transparencia y acceso público responsable para crisis, servicios y herramientas de apoyo."
                canonicalPath="/"
                schema={[
                    buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION),
                    buildWebSiteSchema({
                        name: 'Basileia',
                        url: 'https://basileia.tech',
                        description: 'Telepsicología clínica en Colombia con recursos públicos, crisis y acompañamiento responsable.',
                        publisher: buildMedicalOrganizationSchema(PUBLIC_CLINICAL_ORGANIZATION),
                    }),
                    homeFaq,
                ]}
            />
            { /*---------Hero Section-------- */}
            
            <section className="hero_section pt-[60px] pb-24 lg:pb-32 2xl:h-[800px]">                  
                <div className="container">
                    <div className="flex flex-col lg:flex-row gap-20 items-start lg:items-center justify-between">
                    
                        {/*---------Hero Content-------- */}
                        <div className="lg:w-6/12">
                            <div className="lg:max-w-[570px]">
                                <h1 className="text-[32px] leading-[1.2] text-headingColor font-[800] md:text-[44px] md:leading-[1.2] mb-6 tracking-tight">
                                    Servicio psicológico profesional, centrado en tu proceso.
                                </h1>
                                
                                <div className="space-y-4 text-[16px] leading-[1.7] text-textColor font-[400]">
                                    <p>
                                        La Terapia Cognitivo-Conductual es un enfoque estructurado y respaldado por evidencia científica para el tratamiento de la ansiedad, la depresión y otros tipos de malestar emocional.
                                    </p>

                                    <p>
                                        El proceso inicia con una evaluación cuidadosa y una formulación individualizada, que permite comprender cómo determinados pensamientos, emociones y conductas están influyendo en tu bienestar. A partir de allí, trabajamos con estrategias concretas y técnicas validadas, orientadas a generar cambios reales y sostenibles.
                                    </p>

                                    <div className="pl-4 border-l-4 border-primaryColor/20 py-1 my-6 bg-gray-50/50 rounded-r-lg">
                                        <p className="italic text-slate-700">
                                            "El servicio psicológico se concibe como una responsabilidad profesional frente al sufrimiento humano. Cada proceso se desarrolla con rigor metodológico, compromiso ético y respeto profundo por la dignidad de la persona."
                                        </p>
                                    </div>

                                    <p className="font-medium text-headingColor text-[17px]">
                                        Encontrarás un espacio serio, confidencial y adaptado a tu ritmo.
                                    </p>
                                </div>

                                <div className="mt-8 flex justify-start">
                                    <button
                                        className="btn w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2 hover:shadow-lg transform transition-all duration-200"
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && window.openChatbot) {
                                                window.openChatbot();
                                            }
                                        }}
                                    >
                                        Solicitar evaluación inicial
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/*---------Hero indicators (Español)-------- */}
                            <div className="mt-[30px] lg:mt-[70] flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-[30px]">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🧭</span>
                                    <p className="text_para">Experiencia sólida en atención psicológica clínica</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💻</span>
                                    <p className="text_para">Terapia digital personalizada y confidencial</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🌿</span>
                                    <p className="text_para">Enfoque especializado en ansiedad y depresión</p>
                                </div>
                            </div>
                        </div>
                        {/*---------Hero Content-------- */}

                        <div className="lg:w-6/12 flex items-center justify-end">
                            <div className="flex items-center gap-8 lg:gap-10">
                                <div className="w-[280px] sm:w-[360px] md:w-[440px] lg:w-[560px]">
                                    <img src={heroImg01} fetchpriority="high" loading="eager" decoding="async" width="560" height="560" alt="Imagen principal" className="w-full h-auto rounded-lg shadow-lg object-cover" />
                                </div>

                                <div className="flex flex-col gap-6 pt-6 lg:pt-0">
                                    <img src={heroImg02} fetchpriority="low" loading="lazy" decoding="async" width="240" height="240" alt="Secundaria 1" className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[240px] rounded-lg shadow-sm object-cover" />
                                    <img src={heroImg03} fetchpriority="low" loading="lazy" decoding="async" width="240" height="240" alt="Secundaria 2" className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[240px] rounded-lg shadow-sm object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>       
            {/*---------hero section end -------- */}

            <section className="mt-12 lg:mt-20">
                <div className="container"> 
                    <div className="lg:w-[470px] mx-auto">
                        <h2 className="heading text-center">
                            Acompañamiento psicológico centrado en ti
                        </h2>
                        <p className= "text_para text-center">
                            Cada proceso terapéutico es un espacio para comprender, sanar y reconstruir tu bienestar emocional desde la evidencia y la empatía.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]"> 

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon01} loading="lazy" decoding="async" alt="Ícono fase exploratoria"/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    🧠 Explora tu proceso terapéutico
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Descubre un espacio profesional diseñado para acompañarte en el manejo de la ansiedad, la depresión y los pensamientos recurrentes.
                                    Aquí comienzas a entender lo que sientes, sin juicios y con un enfoque claro hacia tu bienestar.
                                </p>
                                
                                
                            </div>  

                        </div>

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon02} loading="lazy" decoding="async" alt="Ícono conexión virtual"/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    💬 Conecta desde donde estés
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Accede a sesiones en línea seguras, privadas y humanas.
                                    La terapia digital te permite cuidar tu salud mental con la misma profundidad de un encuentro presencial, desde la comodidad de tu entorno.
                                </p>
                                
                                
                            </div>  

                        </div>

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon03} loading="lazy" decoding="async" alt="Ícono agendamiento"/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    🗓️ Agenda y da continuidad a tu proceso
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Organiza tus sesiones, revisa tus avances y recibe acompañamiento constante.
                                    Tu espacio terapéutico digital te permite mantener el ritmo de tu crecimiento, paso a paso y con propósito.
                                </p>
                                
                                
                            </div>  

                        </div>

                    </div>
                </div>
            </section>

            <section className="mt-12 lg:mt-20">
                <div className="container">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="heading">Recursos especializados para búsquedas concretas</h2>
                        <p className="text_para mt-2">
                            Si buscas apoyo para ELA, duelo anticipado o psicooncología, estas rutas están pensadas para responder con claridad y sin fricción.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/recursos-clinicos"
                                className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Ver el centro de recursos
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        <Link to="/psicologo-bogota" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Bogotá</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo en Bogotá</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Si buscas psicólogo en Bogotá, aquí tienes una ruta virtual, clara y clínica.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-bogota" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Online Bogotá</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Bogotá</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Ruta comercial para quienes quieren atención online desde Bogotá sin perder continuidad.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-bogota-ansiedad" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Bogotá · Ansiedad</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Bogotá para ansiedad</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Ruta específica para búsquedas de atención online por ansiedad desde Bogotá.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-bogota-duelo" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Bogotá · Duelo</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Bogotá para duelo</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Ruta respetuosa para acompañamiento online durante procesos de pérdida.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-colombia-ansiedad" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Colombia · Ansiedad</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Colombia para ansiedad</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Entrada nacional para búsquedas de psicólogos online enfocados en ansiedad.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-colombia-duelo" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Colombia · Duelo</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Colombia para duelo</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Ruta nacional de apoyo online para procesos de pérdida en Colombia.
                            </p>
                        </Link>

                        <Link to="/terapia-online-bogota" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Terapia Bogotá</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Terapia online en Bogotá</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Entrada directa para usuarios que quieren iniciar terapia online desde Bogotá.
                            </p>
                        </Link>

                        <Link to="/terapia-online-bogota-depresion" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Bogotá · Depresión</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Terapia online en Bogotá para depresión</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Variante comercial para captar búsquedas de terapia online por depresión en Bogotá.
                            </p>
                        </Link>

                        <Link to="/psicologia-online-ansiedad" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Ansiedad</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicología online para ansiedad</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Una entrada directa para quien necesita empezar terapia online por ansiedad.
                            </p>
                        </Link>

                        <Link to="/psicologia-online-depresion" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Depresión</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicología online para depresión</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Una opción pensada para búsquedas de ayuda online por depresión.
                            </p>
                        </Link>

                        <Link to="/terapia-online-depresion" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Terapia</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Terapia online para depresión</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Variante transaccional para quien busca empezar terapia online por depresión.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-duelo" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Duelo</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online para duelo</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Entrada respetuosa para acompañamiento online en procesos de pérdida.
                            </p>
                        </Link>

                        <Link to="/terapia-depresion-colombia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Depresión</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Terapia para depresión en Colombia</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Atención virtual y accesible para búsquedas de terapia por depresión en el país.
                            </p>
                        </Link>

                        <Link to="/psicologo-virtual-colombia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Virtual</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo virtual en Colombia</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Una entrada directa para quien busca atención virtual desde cualquier ciudad del país.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-colombia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Online</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online en Colombia</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Acompañamiento psicológico online con foco en claridad, acceso y continuidad.
                            </p>
                        </Link>

                        <Link to="/terapia-online-colombia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Terapia</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Terapia online en Colombia</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Ideal para búsquedas de terapia online con acceso sencillo y enfoque clínico.
                            </p>
                        </Link>

                        <Link to="/psicologo-online-ansiedad" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Ansiedad</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo online para ansiedad</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Variante comercial para quienes buscan ayuda online por ansiedad.
                            </p>
                        </Link>

                        <Link to="/psicologo-virtual-depresion" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Depresión</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicólogo virtual para depresión</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Otra puerta de entrada para búsquedas sobre depresión y atención virtual.
                            </p>
                        </Link>

                        <Link to="/psicologia-colombia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Colombia</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicología en Colombia</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Para búsquedas amplias de psicología con atención virtual y acceso público responsable.
                            </p>
                        </Link>

                        <Link to="/psicologia-virtual" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Virtual</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicología virtual</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Continuidad clínica para quienes necesitan sesiones desde cualquier lugar del país.
                            </p>
                        </Link>

                        <Link to="/psicologia-en-linea" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">En línea</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicología en línea</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Una forma clara de iniciar terapia online con acompañamiento serio y estructura.
                            </p>
                        </Link>

                        <Link to="/ela" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">ELA</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Apoyo psicológico para ELA</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Información para pacientes, familias y cuidadores que necesitan orientación emocional y práctica.
                            </p>
                        </Link>

                        <Link to="/duelo-anticipado" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Duelo anticipado</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Acompañamiento en duelo anticipado</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Recursos para sostener cambios emocionales antes de una pérdida esperada o un diagnóstico complejo.
                            </p>
                        </Link>

                        <Link to="/psicooncologia" className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Psicooncología</p>
                            <h3 className="mt-3 text-xl font-bold text-headingColor">Psicooncología y cáncer avanzado</h3>
                            <p className="mt-3 text-sm leading-6 text-textColor">
                                Orientación para atravesar tratamiento, incertidumbre y acompañamiento a cuidadores.
                            </p>
                        </Link>
                    </div>
                </div>
            </section>
            
            <About />

            {/*---services section removed (moved to /services)---*/}

            {/*---feature section---*/}
            <section>
                <div className="container">
                    <div className="flex items-center justify-between flex-col lg:flex-row">
                            {/*---feature content---*/}
                        <div className="xl:w-[670px]">
                            <h2 className="heading text-center">
                                    Atención psicológica virtual, cuando la necesites.
                                </h2>
                                <p className="text_para mt-2">Recibe acompañamiento profesional sin importar dónde estés. Nuestra plataforma te conecta con psicólogos clínicos especializados en Terapia Cognitivo-Conductual (TCC) y enfoques de tercera generación, garantizando una atención basada en la ciencia y la confidencialidad.</p>

                                <ul className="pl-4 mt-4 space-y-3">
                                    <li className="text_para flex items-start gap-3">
                                        <span className="inline-block text-2xl mt-1">🗓️</span>
                                        <span>Agenda tu cita fácilmente: selecciona el horario que mejor se ajuste a tu rutina.</span>
                                    </li>
                                    <li className="text_para flex items-start gap-3">
                                        <span className="inline-block text-2xl mt-1">💬</span>
                                        <span>Sesiones en línea, con rigor clínico y acompañamiento humano: Cada proceso terapéutico se diseña desde la evidencia científica, adaptado a tu historia y tus objetivos.</span>
                                    </li>
                                    <li className="text_para flex items-start gap-3">
                                        <span className="inline-block text-2xl mt-1">🧠</span>
                                        <span>Comienza tu proceso terapéutico: accede a tu sesión en línea desde cualquier dispositivo, en un entorno seguro y privado.</span>
                                    </li>
                                </ul>

                                <div className="flex justify-center mt-6">
                                    <Link to="/contact">
                                        <button className="btn">Conoce más</button>
                                    </Link>
                                </div>
                        </div>

                                {/*---feature image---*/}
                        <div className="relative z-10 xl:w-[770px] flex justify-end mt-[50px] lg:mt-0">
                            <img src={featureimg} loading="lazy" decoding="async" width="560" height="560" className="w-3/4" alt=""/>

                            <div className="w-[150px] lg:w-[248px] bg-white absolute bottom-[50px] left-0 md:bottom-[100px] md:left-5 z-20 p-2
                            pb-3 lg:pt-4 lg:px-4 lg:pb-[26px] rounded-[10px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[6px] lg:gap-3">
                                        <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[600]">
                                            Mar, 24
                                        </p>
                                        <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[600]">
                                            10:00 a. m.
                                        </p>
                                    </div>
                                    <span className="w-5 h-5 lg:w-[34px] lg:h-[34px] flex items-center justify-center bg-yellowColor rounded
                                    py-1 px-[6px] lg:py-3 lg:px-[9px]">
                                        <img src={videoIcon} loading="lazy" decoding="async" width="24" height="24" alt=""/>
                                    </span>
                                </div>
                                
                                <div className="w-[65px] lg:w-[96px] bg-[#ccf0f3] py-1 px-2 lg:py-[6px] lg:px-[10px] text-[8px] leading-[8px] 
                                lg:text-[12px] lg:leading-4 text-irisBlueColor font-[500] mt-2 lg:mt-4 rounded-full">                                 
                                    Consulta                             
                                </div>                                

                                <div className="flex items-center gap-[6px] lg:gap[10px] mt-2 lg:mt-[18px]">
                                    <img src={avatarIcon} loading="lazy" decoding="async" alt="" />
                                    <h4 className="text-[10px] leading-3 lg:text-[16px] lg:leading-[22px] font-[700] text-headingColor"> 
                                        Dra. Laura Gómez                                         
                                    </h4>
                                </div>                                
                            </div>
                        </div>
                    </div>    
                </div>
            </section>
            {/*---feature section end---*/}



            {/*---our great doctors removed per request---*/}

            {/*---faq section---*/}
            <section>
                <div className="container">
                    <div className="flex justify-between gap-[50px] lg:gap:0">
                        <div className="w-1/2 hidden md:block">
                            <img src={faqimg} loading="lazy" decoding="async" width="500" height="500" alt=""/>
                        </div>

                        <div className="w-full md:w-1/2">
                            <h2 className="heading">
                                🗣️ Preguntas frecuentes de nuestros pacientes
                            </h2>

                            <Faqlist /> 
                        </div>
                    </div>
                </div>
            </section>
            {/*---faq section end---*/}

            {/*---testimonial removed; moved to /testimonios per request---*/}
                
        </>
    );
};

export default Home;
