import React from 'react';

import {Link} from 'react-router-dom';
import {RiLinkedinFill} from 'react-icons/ri';
import {AiFillYoutube, AiFillGithub, AiOutlineInstagram} from 'react-icons/ai';


const socialLinks = [
    {
        path: 'https://www.youtube.com',
        icon: <AiFillYoutube className="group-hover:text-white w-4 h-5"/>,
    },
    {
        path: 'https://www.github.com',
        icon: <AiFillGithub className="group-hover:text-white w-4 h-5"/>,
    },
    {
        path: 'https://www.instagram.com',
        icon: <AiOutlineInstagram className="group-hover:text-white w-4 h-5"/>,
    },
    {
        path: 'https://www.linkedin.com',
        icon: <RiLinkedinFill className="group-hover:text-white w-4 h-5"/>,
    },
]

const quickLinks01 = [
    {
        path: "/home",
        display: "Inicio",
    },
    {
        path: "/services",
        display: "Servicios",
    },
]

const quickLinks02 = [
    {
        path: "/",
        display: "Solicita una cita",
    },
    {
        path: "/testimonios",
        display: "Obtener una opinion",
    },
]

const quickLinks03 = [
    {
        path: "/contact",
        display: "Contactanos",
    },
    {
        path: "/data-protection",
        display: "Política de Privacidad",
    },
    {
        path: "/terms-of-service",
        display: "Términos y Condiciones",
    },
]

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="pb-16 pt-10">
            <div className="container">
                <div className="flex justify-between flex-col md:flex-row flex-wrap gap-[30px]">
                    <div>
                        <div className="mb-8">
                            <div className="flex flex-col">
                                <span 
                                    className="text-[2.25rem] font-normal tracking-tight leading-none text-slate-900"
                                    style={{ 
                                        fontFamily: "'Cormorant Garamond', 'Libre Baskerville', 'Crimson Text', Georgia, serif",
                                        fontWeight: 500,
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    Βασιλειάς
                                </span>
                                <span 
                                    className="text-[0.55rem] font-medium tracking-[0.35em] text-slate-500 uppercase mt-1 ml-0.5"
                                    style={{ 
                                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                                        fontWeight: 500
                                    }}
                                >
                                    BASILEIA
                                </span>
                            </div>
                            
                            <div className="mt-4 pl-1 border-l-2 border-slate-200">
                                <p 
                                    className="text-[0.8rem] italic text-slate-600 leading-relaxed"
                                    style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}
                                >
                                    "Όπου η χρεία, εκεί και η διακονία"
                                </p>
                                <p 
                                    className="text-[0.65rem] text-slate-400 font-medium tracking-wide uppercase mt-1"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Donde está la necesidad, allí debe estar el servicio
                                </p>
                            </div>
                        </div>
                        <p className="text-[16px] leading-7 font-[400] text-textColor">
                            Copyright {year} desarrollado por Bogobyte. Todos los derechos reservados.
                        </p>
                        
                        <div className= "flex items-center gap-3 mt-4">
                            {socialLinks.map((link, index) => (
                                <Link 
                                    to={link.path} 
                                    key={index} 
                                    className="w-9 h-9 border border-solid border-[#181A1E] rounded-full flex
                                    items-center justify-center group hover:bg-primaryColor hover_border-none"
                                >
                                    {link.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
                            Enlaces rapidos
                        </h2>

                        <ul>
                            {quickLinks01.map((item, index) => (
                                <li key={index} className="mb-4">
                                    <Link to={item.path} className="text-[16px] leading-7 font-[400] text-textColor">
                                        {item.display}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
                            Quiero:
                        </h2>

                        <ul>
                            {quickLinks02.map((item, index) => (
                                <li key={index} className="mb-4">
                                    <Link to={item.path} className="text-[16px] leading-7 font-[400] text-textColor">
                                        {item.display}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
                            Soporte
                        </h2>

                        <ul>
                            {quickLinks03.map((item, index) => (
                                <li key={index} className="mb-4">
                                    <Link to={item.path} className="text-[16px] leading-7 font-[400] text-textColor">
                                        {item.display}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* VERSION TAG PARA OBSERVABILIDAD DE PRODUCCIÓN */}
                <div className="flex justify-center mt-8 pt-4 border-t border-solid border-[#181A1E]">
                    <p className="text-[12px] leading-7 font-[400] text-gray-400">
                        Basileia v1.0.1 🛡️ Hardened Build
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer ;