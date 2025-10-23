import React from 'react';
import {Pagination} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import patientAvatar from '../../assets/images/patient-avatar.png';
import {HiStar} from "react-icons/hi";


const Testimonial = ({ additionalTestimonials = [] }) => {
    return (
    <div className="mt-[40px] lg:mt-[80px]">
        <Swiper 
            modules ={[Pagination]} 
            spaceBetween={30} 
            slidesPerView={1} 
            pagination={{clickable:true}}
            breakpoints={{
                640: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },                
            }}
        >
            <SwiperSlide>
                <div className="py-[40px] px-5 rounded-3">
                    <div className="flex items-center gap-[13px]">
                        <img src={patientAvatar} alt=""/> 
                        <div>
                            <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                                María G.
                            </h4>
                            <div className="flex items-center gap-[2px]">
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                            </div>    
                        </div>
                    </div>
                    <p className="text-[16px] leading-7 mt-4 text-textColor font-[400]">
                        “Aprendí a reconocer mis pensamientos y entender mis emociones. Hoy manejo mi ansiedad con herramientas que realmente funcionan.”
                        <br />
                        — María G., paciente en terapia cognitivo-conductual.
                    </p>    
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="py-[40px] px-5 rounded-3">
                    <div className="flex items-center gap-[13px]">
                        <img src={patientAvatar} alt=""/> 
                        <div>
                            <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                                Andrés P.
                            </h4>
                            <div className="flex items-center gap-[2px]">
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                            </div>    
                        </div>
                    </div>
                    <p className="text-[16px] leading-7 mt-4 text-textColor font-[400]">
                        “Nunca imaginé que la terapia en línea pudiera sentirse tan cercana. Siento acompañamiento real y resultados que puedo medir.”
                        <br />
                        — Andrés P., paciente con seguimiento digital.
                    </p>    
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="py-[40px] px-5 rounded-3">
                    <div className="flex items-center gap-[13px]">
                        <img src={patientAvatar} alt=""/> 
                        <div>
                            <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                                Laura M.
                            </h4>
                            <div className="flex items-center gap-[2px]">
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                            </div>    
                        </div>
                    </div>
                    <p className="text-[16px] leading-7 mt-4 text-textColor font-[400]">
                        “Aquí no solo encontré orientación, sino una forma práctica de entenderme mejor. Es un proceso que realmente transforma.”
                        <br />
                        — Laura M., paciente en tratamiento integral.
                    </p>    
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="py-[40px] px-5 rounded-3">
                    <div className="flex items-center gap-[13px]">
                        <img src={patientAvatar} alt=""/> 
                        <div>
                            <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                                Alejandro Martinez 
                            </h4>
                            <div className="flex items-center gap-[2px]">
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                                <HiStar className="text-yellowColor w-[18px] h-5"/>
                            </div>    
                        </div>
                    </div>
                    <p className="text-[16px] leading-7 mt-4 text-textColor font-[400]">
                        "I have taken medical services from them. They treat so well and 
                        they are providing the best medical services"
                    </p>    
                </div>
            </SwiperSlide>
            {/* existing hard-coded slides above... */}

            {/* render any additional testimonials passed from parent (e.g., user submissions) */}
            {additionalTestimonials.map((t, idx) => (
                <SwiperSlide key={`user-test-${idx}-${t.createdAt || idx}`}>
                    <div className="py-[40px] px-5 rounded-3">
                        <div className="flex items-center gap-[13px]">
                            <img src={patientAvatar} alt=""/>
                            <div>
                                <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                                    {t.name || 'Anónimo'}
                                </h4>
                                <div className="flex items-center gap-[2px]">
                                    <HiStar className="text-yellowColor w-[18px] h-5"/>
                                    <HiStar className="text-yellowColor w-[18px] h-5"/>
                                    <HiStar className="text-yellowColor w-[18px] h-5"/>
                                    <HiStar className="text-yellowColor w-[18px] h-5"/>
                                    <HiStar className="text-yellowColor w-[18px] h-5"/>
                                </div>
                            </div>
                        </div>
                        <p className="text-[16px] leading-7 mt-4 text-textColor font-[400]">
                            {t.text}
                        </p>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
        </ div>
    );
};

export default Testimonial;