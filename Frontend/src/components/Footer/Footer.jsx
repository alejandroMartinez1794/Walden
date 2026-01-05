import React from 'react';

import {Link} from 'react-router-dom';
import logo from '../../assets/images/PsicoNepsis.png';
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
        path: "/",
        display: "Sobre nosotros",
    },
    {
        path: "/services",
        display: "Servicios",
    },
    {
        path: "/",
        display: "Blog",
    },
]

const quickLinks02 = [
    {
        path: "/",
        display: "Solicita una cita",
    },
    {
        path: "/",
        display: "Obtener una opinion",
    },
]

const quickLinks03 = [
    {
        path: "/",
        display: "Donar",
    },
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
                        <img src={logo} alt="" className="w-40 mb-6 mix-blend-multiply"/>
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
            </div>            
        </footer>
    );
};

export default Footer ;