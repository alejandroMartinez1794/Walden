import React from 'react';
import Testimonial from '../components/Testimonial/testimonial';

const Testimonios = () => {
  return (
    <section className="mt-[40px] mb-[60px]">
      <div className="container">
        <div className="xl:w-[770px] mx-auto">
          <h2 className="heading text-center"> 🩺 Lo que nuestros pacientes expresan </h2>
          <p className="text_para text-center mt-2">
            Cuidado psicológico con propósito y humanidad. Cada proceso terapéutico es una historia de cambio. A través de la escucha, la comprensión y el trabajo conjunto, nuestros pacientes descubren nuevas formas de pensar, sentir y vivir con bienestar.
          </p>
        </div>

        <div className="mt-[30px]">
          <Testimonial />
        </div>
      </div>
    </section>
  );
};

export default Testimonios;
