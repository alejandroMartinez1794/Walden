import React from 'react';
import brandImage from '../../assets/images/logo_principal_basileia.png';

const BrandLogo = ({ variant = 'header', className = '' }) => {
  if (variant === 'icon') {
    return (
      <img
        src={brandImage}
        alt="Basileia"
        className={`h-12 w-auto object-contain ${className}`}
      />
    );
  }

  if (variant === 'footer') {
    return (
      <img
        src={brandImage}
        alt="Basileia Centro Psicológico"
        className={`w-[260px] max-w-full object-contain md:w-[340px] mix-blend-multiply ${className}`}
        style={{ filter: "brightness(1.03) contrast(1.05)" }}
      />
    );
  }

  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <span className="inline-flex h-11 w-11 overflow-hidden rounded-full ring-1 ring-slate-300 md:h-12 md:w-12">
          <img
            src={brandImage}
            alt="Basileia"
            className="h-full w-full object-cover object-top"
          />
        </span>
        <span
          className="leading-none text-slate-800"
          style={{
            fontFamily: "'Cormorant Garamond', 'Libre Baskerville', Georgia, serif",
            fontWeight: 600,
            fontSize: '2.15rem',
            letterSpacing: '-0.02em',
          }}
        >
          Βασιλεία
        </span>
      </div>
    );
  }

  return (
    <img
      src={brandImage}
      alt="Basileia"
      className={`h-14 w-auto object-contain md:h-16 ${className}`}
    />
  );
};

export default BrandLogo;
