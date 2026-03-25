import React, { memo } from 'react';
import aboutimg from '../../assets/images/about.png';
import aboutCardimg from '../../assets/images/about-card.png';
import { Link } from 'react-router-dom';


const About = () => {
    return (
        <section>
            <div className="container">
                <div className="flex justify-between gap-[50px] lg:gap-[130px] xl:gap-0 flex-col lg:flex-row">
                    {/*------- About Img---------- */}
                    <div className="relative w-3/4 lg:w-1/2 xl:w-[770px] z-10 order-2 lg:order-1">
                        <img src={aboutimg} alt="" />
                        <div className="absolute z-20 bottom-4 w-[200px] md:w-[300px] right-[-30%] md:right-[-7%] lg:right-[22%]"> 
                        <img src={aboutCardimg} alt="" />
                        </div>
                    </div>

                    {/*------- About Content---------- */}
                    <div className="w-full lg:w-1/2 xl:w-[670px] order-1 lg:order-2">
                        <h2 className="heading text-center">La ciencia detrás del cambio: Terapia Cognitivo-Conductual (TCC)</h2>
                        <p className="text_para">La Terapia Cognitivo-Conductual (TCC) es el modelo psicológico con mayor respaldo científico en el tratamiento de la depresión, la ansiedad y los trastornos emocionales contemporáneos. Basada en décadas de investigación clínica, la TCC demuestra que los pensamientos, las emociones y las conductas están interconectados: al modificar patrones de pensamiento disfuncionales, se generan cambios duraderos en la forma de sentir y actuar.</p>
                            <p className= "text_para mt-[30px]">Mi práctica profesional se centra en aplicar este enfoque de manera personalizada, utilizando técnicas validadas como la reestructuración cognitiva, la exposición gradual y el entrenamiento en habilidades de afrontamiento. Cada intervención se fundamenta en evidencia empírica, con el propósito de que cada paciente logre comprender sus procesos internos, reducir su malestar y recuperar su capacidad de vivir con equilibrio, claridad y propósito.</p>

                            <div className="flex justify-center mt-6">
                                <Link to='/services' >
                                    <button className="btn">Conoce más</button>
                                </Link>
                            </div>
                    </div>                        
                </div>    
            </div>
        </section>    
    );
};

export default memo(About);