export type MedicalOrganizationSchema = {
  '@context': 'https://schema.org';
  '@type': 'MedicalOrganization';
  name: string;
  url: string;
  description: string;
  areaServed: {
    '@type': 'Country';
    name: string;
  };
  medicalSpecialty: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    telephone?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
};

export type FAQQuestionAnswer = {
  question: string;
  answer: string;
};

export type FAQPageSchema = {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
};

export type PhysicianSchema = {
  '@context': 'https://schema.org';
  '@type': 'Physician';
  name: string;
  url: string;
  description: string;
  medicalSpecialty: string;
  image?: string;
  sameAs?: string[];
};

export type ClinicalSchema = MedicalOrganizationSchema | FAQPageSchema | PhysicianSchema;

export type ClinicalOrganizationProfile = {
  name: string;
  url: string;
  description: string;
  medicalSpecialty?: string;
  telephone?: string;
  availableLanguage?: string[];
  sameAs?: string[];
};

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://basileia.tech';

export const PUBLIC_CLINICAL_ORGANIZATION: ClinicalOrganizationProfile = {
  name: 'Basileia',
  url: PUBLIC_SITE_URL,
  description: 'Telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.',
  medicalSpecialty: 'Psychology',
  telephone: '+57 106',
  availableLanguage: ['es-CO'],
};

export function buildMedicalOrganizationSchema(profile: ClinicalOrganizationProfile): MedicalOrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: profile.name,
    url: profile.url,
    description: profile.description,
    areaServed: {
      '@type': 'Country',
      name: 'Colombia',
    },
    medicalSpecialty: profile.medicalSpecialty ?? 'Psychology',
    contactPoint: profile.telephone
      ? {
          '@type': 'ContactPoint',
          contactType: 'patient support',
          telephone: profile.telephone,
          availableLanguage: profile.availableLanguage ?? ['es-CO'],
        }
      : undefined,
    sameAs: profile.sameAs,
  };
}

export function buildFAQPageSchema(items: FAQQuestionAnswer[]): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildPhysicianSchema(profile: {
  name: string;
  url: string;
  description: string;
  medicalSpecialty: string;
  image?: string;
  sameAs?: string[];
}): PhysicianSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: profile.name,
    url: profile.url,
    description: profile.description,
    medicalSpecialty: profile.medicalSpecialty,
    image: profile.image,
    sameAs: profile.sameAs,
  };
}

export function buildCrisisFAQSchema(): FAQPageSchema {
  return buildFAQPageSchema([
    {
      question: '¿Qué hago si necesito ayuda psicológica inmediata?',
      answer: 'Llama a la línea 106 o a emergencias locales si existe riesgo inmediato. Luego busca acompañamiento profesional presencial o virtual lo antes posible.',
    },
    {
      question: '¿La información de esta página incluye datos personales sensibles?',
      answer: 'No. Esta página solo publica orientación general y recursos de apoyo; no debe contener datos clínicos, identificadores ni tokens.',
    },
    {
      question: '¿Cómo actúo si la persona está en riesgo de hacerse daño?',
      answer: 'Acompaña sin dejarla sola, retira medios de daño si es seguro hacerlo y contacta de inmediato a servicios de emergencia o una línea de crisis local.',
    },
  ]);
}