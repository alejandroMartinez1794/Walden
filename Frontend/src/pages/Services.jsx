import { services } from '../assets/data/services';
import ServiceCard from '../components/Services/servicecard';

const Services   = () => {
    return (
        <section>
            <div className="container">
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
    )
}

export default Services;
