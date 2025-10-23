import React from 'react';
import { Link } from 'react-router-dom';
import Testimonial from '../components/Testimonial/testimonial';
import ConsentModal, { anonymizeTestimony } from '../components/Testimonial/ConsentModal';
import { useState } from 'react';

const Testimonios = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userTestimonials, setUserTestimonials] = useState(window.__userTestimonials__ || []);

  return (
    <section className="mt-[40px] mb-[60px]">
      <div className="container">
        <div className="xl:w-[770px] mx-auto">
          <h2 className="heading text-center">🩺 Lo que nuestros pacientes expresan</h2>

          <p className="text_para text-center mt-4">
            Cuidado psicológico con propósito y humanidad. Cada proceso terapéutico es una historia de cambio.
            A través de la escucha, la comprensión y el trabajo conjunto, nuestros pacientes descubren nuevas formas de pensar, sentir y vivir con bienestar.
          </p>

          <div className="mt-6 text-center">
            <p className="text_para max-w-[760px] mx-auto">
              Estas experiencias reflejan procesos reales de trabajo clínico basado en la Terapia Cognitivo-Conductual (TCC).
              Si te interesa empezar un proceso, puedes agendar una cita o hablar con nuestro asistente virtual para resolver dudas rápidas.
            </p>
          </div>
        </div>

        {/* Why trust / highlights */}
        <div className="mt-10 xl:w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded shadow-sm text-center">
            <div className="text-3xl mb-2">🔬</div>
            <h4 className="font-semibold">Enfoque basado en evidencia</h4>
            <p className="text-sm mt-2">Intervenciones con respaldo científico y técnicas validadas.</p>
          </div>

          <div className="p-4 bg-white rounded shadow-sm text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="font-semibold">Acompañamiento humano</h4>
            <p className="text-sm mt-2">Atención clínica personalizada y centrada en tu experiencia.</p>
          </div>

          <div className="p-4 bg-white rounded shadow-sm text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold">Confidencialidad</h4>
            <p className="text-sm mt-2">Protegemos tus datos y tu proceso terapéutico con estándares éticos.</p>
          </div>
        </div>

        {/* Testimonials slider */}
        <div className="mt-[40px]">
          <Testimonial additionalTestimonials={userTestimonials} />
        </div>

        {/* user submissions handled below via modal */}

        {/* Consent / publishing notice for testimonials */}
        <div className="mt-6 max-w-[900px] mx-auto bg-[rgba(15,23,42,0.03)] border border-[rgba(15,23,42,0.06)] p-4 rounded text-sm text-textColor">
          <h5 className="font-semibold">Consentimiento para publicación de testimonios</h5>
          <p className="mt-2">
            Los testimonios mostrados en esta página se publican únicamente con el consentimiento informado de las
            personas que los compartieron. No se incluyen datos clínicos sensibles ni información que pueda
            identificar a terceros sin autorización.
          </p>
          <p className="mt-2">
            Si quieres solicitar la eliminación, anonimización o modificación de tu testimonio, escríbenos a través de
            la <Link to="/contact" className="font-medium underline">página de contacto</Link> o envía un correo a nuestro equipo indicando
            el motivo. Responderemos tu solicitud a la brevedad.
          </p>
          <p className="mt-2 text-xs text-gray-500">Última actualización: 23 de octubre de 2025</p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/contact">
            <button className="btn">Agendar una cita</button>
          </Link>

          <button
            className="btn"
            onClick={() => {
              if (typeof window !== 'undefined' && window.openChatbot) window.openChatbot();
            }}
          >
            Hablar con el asistente
          </button>

          <button className="btn" onClick={() => setModalOpen(true)}>Compartir tu testimonio</button>
        </div>

        <div className="mt-8 text-center text-sm text-textColor max-w-[800px] mx-auto">
          <p>
            Si atraviesas una situación de riesgo o emergencia, contacta inmediatamente los servicios de urgencia de tu localidad. Nuestro equipo ofrece apoyo clínico, pero no reemplaza la atención de emergencia.
          </p>
        </div>
        
        {/* Consent modal instance */}
        <ConsentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={(payload) => {
          // append to local state list and show as additional slide
          const prev = window.__userTestimonials__ || [];
          const updated = [payload, ...prev];
          window.__userTestimonials__ = updated;
          // small visual confirmation
          alert('Gracias — tu testimonio ha sido recibido y aparecerá en la sección.');
          // Rerender by forcing a small state change
          setUserTestimonials(updated);
        }} />
      </div>
    </section>
  );
};

export default Testimonios;
