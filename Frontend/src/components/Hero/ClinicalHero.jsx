import React from 'react';
import { Link } from 'react-router-dom';
import heroPortrait from '../../assets/images/hero-img01.png'; // Reemplazar por retrato profesional cuando esté disponible

/*
  Uso y notas de diseño:
  - Paleta sugerida: fondo #FAFAFA, acento verde salvia #7EA395, gris perla #E9ECEB.
  - Tipografía sugerida: Inter o Lato.
  - Animación sugerida: fade-in vertical para texto y botón (se puede aplicar con Tailwind o @keyframes).
  - Reemplazar `heroPortrait` por un retrato profesional (fondo neutro) para mejorar la conexión humana.
*/

const ClinicalHero = () => {
  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="lg:w-1/2" style={{ color: '#2F2F2F' }}>
            <h1 className="text-[30px] md:text-[40px] lg:text-[44px] font-extrabold leading-tight mb-4"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
              Acompañarte en el camino hacia un bienestar más consciente.
            </h1>

            <p className="text-base md:text-lg text-[#4B4B4B] mb-4">
              Un espacio digital de psicología clínica donde la ciencia y la empatía se encuentran.
            </p>

            <p className="text-[#525252] mb-6 leading-relaxed">
              A veces la mente se llena de ruido.
              <br />
              Este espacio fue creado para que encuentres claridad, respires y vuelvas a sentirte en equilibrio.
              <br />
              La terapia es un camino que recorremos juntos, con ciencia, escucha y propósito.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <Link to="/psychology/" title="Da el primer paso hacia tu bienestar.">
                <button className="px-6 py-3 rounded-full text-white font-medium"
                  style={{ backgroundColor: '#7EA395', transition: 'box-shadow .3s ease' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(126,163,149,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  Comienza tu proceso hoy
                </button>
              </Link>
            </div>

            {/* Metrics */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <span className="text-sm">Psicología clínica especializada en TCC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">❤️‍�</span>
                <span className="text-sm">Enfoque en ansiedad y depresión</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">�</span>
                <span className="text-sm">Atención 100% en línea y personalizada</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
              <img src={heroPortrait} alt="Retrato profesional - ejemplo" className="w-full h-auto object-cover" />
              <div className="p-4 bg-[#FAFAFA]">
                <p className="text-sm text-[#6B6B6B]">Imagen sugerida: retrato cálido y sereno en fondo neutro. Reemplaza por la foto profesional del equipo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicalHero;
