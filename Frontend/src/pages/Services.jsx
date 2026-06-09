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
