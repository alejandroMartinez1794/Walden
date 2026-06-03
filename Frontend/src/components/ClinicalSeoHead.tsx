import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import type { ClinicalSchema } from '../seo/medical-schema';

type ClinicalSeoHeadProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schema?: ClinicalSchema | ClinicalSchema[];
  image?: string;
  ogType?: 'website' | 'article';
};

const PROTECTED_SEGMENT_REGEX = /(dashboard|clinical|auth|api|tools|psychology|users\/profile|doctors\/profile)/i;

const DEFAULT_DESCRIPTION = 'Basileia ofrece telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.';
const DEFAULT_SITE_URL = 'https://basileia.tech';

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

function normalizeCanonicalPath(canonicalPath: string | undefined, pathname: string): string {
  const candidate = canonicalPath ?? pathname;

  if (!candidate.startsWith('/')) {
    return `/${candidate}`;
  }

  return candidate;
}

function buildRobotsContent(pathname: string, noIndex?: boolean, noFollow?: boolean): string {
  const shouldHide = Boolean(noIndex) || PROTECTED_SEGMENT_REGEX.test(pathname);

  if (shouldHide) {
    return 'noindex, nofollow, noarchive, nosnippet';
  }

  if (noFollow) {
    return 'index, nofollow';
  }

  return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
}

export default function ClinicalSeoHead({
  title = 'Basileia',
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noIndex,
  noFollow,
  schema,
  image = '/basileia_logo_favicon.png?v=2',
  ogType = 'website',
}: ClinicalSeoHeadProps) {
  const location = useLocation();
  const origin = getOrigin();
  const pathname = location.pathname;
  const canonicalUrl = new URL(normalizeCanonicalPath(canonicalPath, pathname), origin).toString();
  const robotsContent = buildRobotsContent(pathname, noIndex, noFollow);
  const schemaArray = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="es" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={new URL(image, origin).toString()} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={new URL(image, origin).toString()} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {schemaArray.map((item, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}