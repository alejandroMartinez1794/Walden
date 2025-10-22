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

                                <button className="btn">Inicia tu proceso terapéutico</button>
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
                            Providing the best medical services
                        </h2>
                        <p className= "text_para text-center">
                            World-class care for everyone. Our health System offers unmatched, expert health care,
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]"> 

                        <div className="py-[30px] px-5">
                            <div className="flex item-center justify-center">
                                <img src={icon01} alt=""/>
                            </div>

                            <div className="mt-[30px]">
                                <h2 className= "text-[26px] leading-9 text-headingColor font-[700] text-center">
                                    Find a Doctor
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    World-class care for everyone. Our health System offers unmatched, expert health care. 
                                    From the lab to the Clinic
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
                                    Find a Location
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    World-class care for everyone. Our health System offers unmatched, expert health care. 
                                    From the lab to the Clinic
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
                                    Book a Appointment
                                </h2>
                                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                                    World-class care for everyone. Our health System offers unmatched, expert health care. 
                                    From the lab to the Clinic
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

            {/*---services section---*/}
            <section>
                <div className="container">
                    <div className="xl:w-[470px] mx-auto"> 
                        <h2 className="heading text-center"> Our medical services </h2>
                        <p className="text_para text-center"> 
                        World-class care for everyone. Our health System offers unmatched, 
                        expert health care.
                        </p>
                    </div>

                    <ServiceList /> 
                </div>
            </section>

            {/*---services section end---*/}

            {/*---feature section---*/}
            <section>
                <div className="container">
                    <div className="flex items-center justify-between flex-col lg:flex-row">
                            {/*---feature content---*/}
                        <div className="xl:w-[670px]">
                            <h2 className="heading">
                                Get Virtual treatment <br/> anytime.
                            </h2>
                            <ul className="pl-4">
                                <li className="text_para"> 
                                    1. Schedule the appointment directly
                                </li>
                                <li className="text_para"> 
                                    2. Search for your physician here, and contact their office.
                                </li>
                                <li className="text_para"> 
                                    3. View our physician who are accepting new patients. use the online scheduling tool to book an appointment.
                                </li>
                            </ul>
                            <Link to="/">
                                <button className="btn">Learn More</button> 
                            </Link>
                        </div>

                                {/*---feature image---*/}
                        <div className="relative z-10 xl:w-[770px] flex justify-end mt-[50px] lg:mt-0">
                            <img src={featureimg} className="w-3/4" alt=""/>

                            <div className="w-[150px] lg:w-[248px] bg-white absolute bottom-[50px] left-0 md:bottom-[100px] md:left-5 z-20 p-2
                            pb-3 lg:pt-4 lg:px-4 lg:pb-[26px] rounded-[10px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-[6px] lg:gap-3">
                                        <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[600]">
                                            Tue, 24
                                        </p>
                                        <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[600]">
                                            10:00AM
                                        </p>
                                    </div>
                                    <span className="w-5 h-5 lg:w-[34px] lg:h-[34px] flex items-center justify-center bg-yellowColor rounded
                                    py-1 px-[6px] lg:py-3 lg:px-[9px]">
                                        <img src={videoIcon} alt=""/>
                                    </span>
                                </div>
                                
                                <div className="w-[65px] lg:w-[96px] bg-[#ccf0f3] py-1 px-2 lg:py-[6px] lg:px-[10px] text-[8px] leading-[8px] 
                                lg:text-[12px] lg:leading-4 text-irisBlueColor font-[500] mt-2 lg:mt-4 rounded-full">                                
                                    Consultation                            
                                </div>                                

                                <div className="flex items-center gap-[6px] lg:gap[10px] mt-2 lg:mt-[18px]">
                                    <img src={avatarIcon} alt="" />
                                    <h4 className="text-[10px] leading-3 lg:text-[16px] lg:leading-[22px] font-[700] text-headingColor"> 
                                        Wayne Collins                                         
                                    </h4>
                                </div>                                
                            </div>
                        </div>
                    </div>    
                </div>
            </section>
            {/*---feature section end---*/}



            {/*---our great doctors---*/}
            <section>
                <div className="container">
                    <div className="xl:w-[470px] mx-auto"> 
                        <h2 className="heading text-center"> Our Great Doctors  </h2>
                        <p className="text_para text-center"> 
                        World-class care for everyone. Our health System offers unmatched, 
                        expert health care.
                        </p>
                    </div>
                    <Doctorslist/>
                </div>
            </section>                
            {/*---our great doctors---*/}

            {/*---faq section---*/}
            <section>
                <div className="container">
                    <div className="flex justify-between gap-[50px] lg:gap:0">
                        <div className="w-1/2 hidden md:block">
                            <img src={faqimg} alt=""/>
                        </div>

                        <div className="w-full md:w-1/2">
                            <h2 className="heading">
                                Most questions by our beloved patients
                            </h2>

                            <Faqlist /> 
                        </div>
                    </div>
                </div>
            </section>
            {/*---faq section end---*/}

            {/*---testimonial---*/}
            <section>
                <div className="container">
                    <div className="xl:w-[470px] mx-auto">
                        <h2 className="heading text-center"> What our patient say </h2>
                        <p className="text_para text-center">
                            world-class care for everyone. Our health System offers unmatched, expert health care.
                        </p>
                    </div>

                    <Testimonial />
                </div>    
            </section>

            {/*---testimonial end---*/}
                
        </>
    );
};

export default Home;
