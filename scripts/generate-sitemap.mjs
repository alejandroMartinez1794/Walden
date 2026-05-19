import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PUBLIC_ROUTES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    title: 'Basileia | Telepsicología clínica en Colombia',
    description: 'Atención psicológica en línea con enfoque clínico, transparencia y acceso público responsable.',
    body: `
      <main class="route-shell route-home">
        <section class="route-hero">
          <p class="eyebrow">Telepsicología clínica</p>
          <h1>Basileia, atención psicológica con claridad, acceso y cuidado.</h1>
          <p>Servicio psicológico profesional, centrado en tu proceso, con recursos públicos para crisis, servicios y orientación clínica.</p>
        </section>
      </main>
    `,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: 'Basileia',
        url: 'https://basileia.example',
        description: 'Telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.',
        areaServed: { '@type': 'Country', name: 'Colombia' },
        medicalSpecialty: 'Psychology',
      },
    ],
  },
  {
    path: '/servicios',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Servicios psicológicos | Basileia',
    description: 'Servicios psicológicos en línea con enfoque cognitivo-conductual, ética y transparencia.',
    body: `
      <main class="route-shell route-services">
        <section class="route-panel">
          <p class="eyebrow">Servicios</p>
          <h1>Nuestros servicios psicológicos</h1>
          <p>Herramientas y acompañamiento basados en evidencia, diseñados para atención responsable y accesible.</p>
        </section>
      </main>
    `,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: 'Basileia',
        url: 'https://basileia.example',
        description: 'Telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.',
        areaServed: { '@type': 'Country', name: 'Colombia' },
        medicalSpecialty: 'Psychology',
      },
    ],
  },
  {
    path: '/crisis',
    priority: '0.95',
    changefreq: 'weekly',
    title: 'Crisis psicológica | Recursos de ayuda inmediata',
    description: 'Recursos públicos y orientaciones seguras para una crisis psicológica, sin PHI.',
    body: `
      <main class="route-shell route-crisis">
        <section class="route-panel route-panel-alert">
          <p class="eyebrow">Atención inmediata</p>
          <h1>Si necesitas apoyo ahora, empieza por una acción concreta.</h1>
          <p>Llama al 106 o al número de emergencia local si existe riesgo inmediato.</p>
          <div class="route-actions">
            <a href="tel:106">Llamar al 106</a>
            <a href="/servicios">Ver servicios</a>
          </div>
        </section>
      </main>
    `,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: 'Basileia',
        url: 'https://basileia.example',
        description: 'Telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.',
        areaServed: { '@type': 'Country', name: 'Colombia' },
        medicalSpecialty: 'Psychology',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué hago si necesito ayuda psicológica inmediata?',
            acceptedAnswer: { '@type': 'Answer', text: 'Llama a la línea 106 o a emergencias locales si existe riesgo inmediato.' },
          },
          {
            '@type': 'Question',
            name: '¿Esta página contiene datos personales sensibles?',
            acceptedAnswer: { '@type': 'Answer', text: 'No. Solo contiene orientación pública, sin PHI, tokens ni rutas internas.' },
          },
        ],
      },
    ],
  },
  {
    path: '/evaluaciones',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Evaluaciones psicológicas | Basileia',
    description: 'Recorrido público por evaluaciones psicológicas de apoyo, sin PHI y con acceso accesible.',
    body: `
      <main class="route-shell route-evaluaciones">
        <section class="route-panel">
          <p class="eyebrow">Evaluaciones</p>
          <h1>Evaluaciones que ayudan a orientar la atención, no a reemplazarla.</h1>
          <p>PHQ-9, GAD-7, WHO-5 y otras herramientas públicas de apoyo clínico.</p>
        </section>
      </main>
    `,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: 'Basileia',
        url: 'https://basileia.example',
        description: 'Telepsicología clínica con acceso público responsable, transparencia y protección estricta de datos sensibles.',
        areaServed: { '@type': 'Country', name: 'Colombia' },
        medicalSpecialty: 'Psychology',
      },
    ],
  },
  {
    path: '/herramientas-tcc',
    priority: '0.5',
    changefreq: 'monthly',
    title: 'Herramientas TCC | Basileia',
    description: 'Herramientas psicoeducativas de TCC, marcadas noindex para minimizar exposición pública de recursos clínicos.',
    noIndex: true,
    body: `
      <main class="route-shell route-tools">
        <section class="route-panel">
          <p class="eyebrow">No indexable</p>
          <h1>Herramientas de Terapia Cognitivo-Conductual</h1>
          <p>Recursos clínicos abiertos para acompañamiento, sin datos sensibles ni rutas internas.</p>
        </section>
      </main>
    `,
    schemas: [],
  },
];

const DISALLOWED_PATHS = ['/dashboard/', '/clinical/', '/auth/', '/api/', '/tools/', '/psychology/'];

function getSiteUrl() {
  return (process.env.VITE_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://basileia.example').replace(/\/$/, '');
}

function buildRobotsTxt(siteUrl) {
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED_PATHS.map((item) => `Disallow: ${item}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  return `${lines.join('\n')}\n`;
}

function buildSitemapXml(siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = PUBLIC_ROUTES.map((route) => `  <url><loc>${siteUrl}${route.path === '/' ? '' : route.path}</loc><lastmod>${today}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function buildStaticHtml(route, baseHtml) {
  const title = route.title;
  const description = route.description;
  const canonical = new URL(route.path, getSiteUrl()).toString();
  const robots = route.noIndex ? 'noindex, nofollow, noarchive, nosnippet' : 'index, follow, max-image-preview:large';
  const schemaJson = route.schemas.map((schema) => `    <script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n');

  return baseHtml
    .replace('<html lang="en">', '<html lang="es">')
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace('</head>', `
    <meta name="description" content="${description}">
    <meta name="robots" content="${robots}">
    <meta name="googlebot" content="${robots}">
    <link rel="canonical" href="${canonical}">
${schemaJson ? `${schemaJson}\n` : ''}  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${route.body}</div>`);
}

export async function generateSeoArtifacts({ distDir = path.resolve(process.cwd(), 'dist'), siteUrl = getSiteUrl() } = {}) {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const baseIndexPath = path.join(distDir, 'index.html');
  const baseHtml = await readFile(baseIndexPath, 'utf8');

  await writeFile(path.join(distDir, 'robots.txt'), buildRobotsTxt(normalizedSiteUrl), 'utf8');
  await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemapXml(normalizedSiteUrl), 'utf8');

  for (const route of PUBLIC_ROUTES) {
    const targetPath = route.path === '/' ? baseIndexPath : path.join(distDir, route.path.slice(1), 'index.html');
    const html = buildStaticHtml(route, baseHtml);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf8');
  }
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const distDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(process.cwd(), 'dist');
  generateSeoArtifacts({ distDir }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}