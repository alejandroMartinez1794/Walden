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
import { BsArrowRight } from "react-icons/bs";
import About from "../components/About/About";
import ServiceList from "../components/Services/ServiceList";
import Doctorslist from "../components/Doctors/Doctorslist";
import Faqlist from "../components/faq/Faqlist";
import Testimonial from "../components/Testimonial/testimonial";




const Home = () => {
    return (
        <>
            { /*---------Hero Section-------- */}
            
            <section className="hero_section pt-[60px] pb-24 lg:pb-32 2xl:h-[800px]">                  
                <div className="container">
                    <div className="flex flex-col lg:flex-row gap-20 items-start lg:items-center justify-between">
                    
                        {/*---------Hero Content-------- */}
                        <div className="lg:w-6/12">
                            <div className="lg:max-w-[520px]">                
                                <h1 className="text-[36px] leading-[46px] text-headingColor font-[800] md:text-[60px]
                                md:leading-[70px]">
                                    Más que una sesión, una experiencia de autocomprensión.
                                </h1>
                                <p className="text_para">
                                    A través de la Terapia Cognitivo-Conductual (TCC), te acompaño a reconocer los patrones que sostienen tu ansiedad, tu tristeza o tu cansancio mental; y a construir, paso a paso, una mente más clara, estable y en paz.
                                </p>

                                <p className="text_para mt-4">
                                    No es terapia automatizada, es atención clínica, humana y adaptada a tu ritmo —en un entorno digital que respeta tus procesos y te da herramientas reales para crecer.
                                </p>

                                                                <div className="flex justify-center mt-6">
                                                                    <button
                                                                        className="btn"
                                                                        onClick={() => {
                                                                            if (typeof window !== 'undefined' && window.openChatbot) {
                                                                                window.openChatbot();
                                                                            }
                                                                        }}
                                                                    >
                                                                        Inicia tu proceso terapéutico
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
                                    <img src={heroImg01} alt="Imagen principal" className="w-full h-auto rounded-lg shadow-lg object-cover" />
                                </div>

                                <div className="flex flex-col gap-6 pt-6 lg:pt-0">
                                    <img src={heroImg02} alt="Secundaria 1" className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[240px] rounded-lg shadow-sm object-cover" />
                                    <img src={heroImg03} alt="Secundaria 2" className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[240px] rounded-lg shadow-sm object-cover" />
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
                                <img src={icon01} alt=""/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    🧠 Explora tu proceso terapéutico
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Descubre un espacio profesional diseñado para acompañarte en el manejo de la ansiedad, la depresión y los pensamientos recurrentes.
                                    Aquí comienzas a entender lo que sientes, sin juicios y con un enfoque claro hacia tu bienestar.
                                </p>
                                
                                <Link 
                                    to="/doctors" 
                                    className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] 
                                    mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor 
                                    hover:border-none"
                                >
                                    <BsArrowRight className="group-hover:text-white w-6 h-5"/>
                                </Link>                                        
                            </div>  

                        </div>

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon02} alt=""/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    💬 Conecta desde donde estés
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Accede a sesiones en línea seguras, privadas y humanas.
                                    La terapia digital te permite cuidar tu salud mental con la misma profundidad de un encuentro presencial, desde la comodidad de tu entorno.
                                </p>
                                
                                <Link 
                                    to="/doctors" 
                                    className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] 
                                    mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor 
                                    hover:border-none"
                                >
                                    <BsArrowRight className="group-hover:text-white w-6 h-5"/>
                                </Link>                                        
                            </div>  

                        </div>

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon03} alt=""/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    🗓️ Agenda y da continuidad a tu proceso
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    Organiza tus sesiones, revisa tus avances y recibe acompañamiento constante.
                                    Tu espacio terapéutico digital te permite mantener el ritmo de tu crecimiento, paso a paso y con propósito.
                                </p>
                                
                                <Link 
                                    to="/doctors" 
                                    className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] 
                                    mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor 
                                    hover:border-none"
                                >
                                    <BsArrowRight className="group-hover:text-white w-6 h-5"/>
                                </Link>                                        
                            </div>  

                        </div>

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
                                    <Link to="/">
                                        <button className="btn">Conoce más</button>
                                    </Link>
                                </div>
                        </div>

                                {/*---feature image---*/}
                        <div className="relative z-10 xl:w-[770px] flex justify-end mt-[50px] lg:mt-0">
                            <img src={featureimg} className="w-3/4" alt=""/>

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
                                        <img src={videoIcon} alt=""/>
                                    </span>
                                </div>
                                
                                <div className="w-[65px] lg:w-[96px] bg-[#ccf0f3] py-1 px-2 lg:py-[6px] lg:px-[10px] text-[8px] leading-[8px] 
                                lg:text-[12px] lg:leading-4 text-irisBlueColor font-[500] mt-2 lg:mt-4 rounded-full">                                 
                                    Consulta                             
                                </div>                                

                                <div className="flex items-center gap-[6px] lg:gap[10px] mt-2 lg:mt-[18px]">
                                    <img src={avatarIcon} alt="" />
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
                            <img src={faqimg} alt=""/>
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
