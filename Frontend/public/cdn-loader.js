/**
 * CDN Loader for External Libraries
 * 
 * This script dynamically loads Recharts and FullCalendar UMD bundles from your CDN.
 * It reads URLs from environment variables (VITE_CDN_*) with fallback to unpkg.com.
 * 
 * Place this script in <head> of index.html before the module entry point.
 * 
 * Usage: <script src="/cdn-loader.js"></script>
 */

(function initCDNLoader() {
  // Default fallback URLs (unpkg.com public CDN)
  const defaults = {
    'VITE_CDN_RECHARTS_URL': 'https://unpkg.com/recharts/umd/Recharts.min.js',
    'VITE_CDN_FULLCALENDAR_CORE_URL': 'https://unpkg.com/@fullcalendar/core@6.1.20/index.global.min.js',
    'VITE_CDN_FULLCALENDAR_DAYGRID_URL': 'https://unpkg.com/@fullcalendar/daygrid@6.1.20/index.global.min.js',
    'VITE_CDN_FULLCALENDAR_TIMEGRID_URL': 'https://unpkg.com/@fullcalendar/timegrid@6.1.20/index.global.min.js',
    'VITE_CDN_FULLCALENDAR_INTERACTION_URL': 'https://unpkg.com/@fullcalendar/interaction@6.1.20/index.global.min.js',
    'VITE_CDN_FULLCALENDAR_REACT_URL': 'https://unpkg.com/@fullcalendar/react@6.1.20/index.global.min.js',
    'VITE_CDN_FULLCALENDAR_LOCALE_ES_URL': 'https://unpkg.com/@fullcalendar/core@6.1.20/locales/es.global.min.js',
  };

  // Read from import.meta.env (Vite injects these)
  const getCDNUrl = (key) => {
    const val = import.meta?.env?.[key] || window.__VITE_ENV?.[key];
    return (val && val !== 'undefined') ? val : defaults[key];
  };

  // Load external scripts
  const scripts = [
    getCDNUrl('VITE_CDN_RECHARTS_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_CORE_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_DAYGRID_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_TIMEGRID_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_INTERACTION_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_REACT_URL'),
    getCDNUrl('VITE_CDN_FULLCALENDAR_LOCALE_ES_URL'),
  ];

  scripts.forEach((url) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = false;
    document.head.appendChild(script);
  });

  console.log('[Basileia CDN] External libraries loaded from:', {
    recharts: getCDNUrl('VITE_CDN_RECHARTS_URL'),
    fullcalendar: {
      core: getCDNUrl('VITE_CDN_FULLCALENDAR_CORE_URL'),
      daygrid: getCDNUrl('VITE_CDN_FULLCALENDAR_DAYGRID_URL'),
      timegrid: getCDNUrl('VITE_CDN_FULLCALENDAR_TIMEGRID_URL'),
      interaction: getCDNUrl('VITE_CDN_FULLCALENDAR_INTERACTION_URL'),
      react: getCDNUrl('VITE_CDN_FULLCALENDAR_REACT_URL'),
      locale_es: getCDNUrl('VITE_CDN_FULLCALENDAR_LOCALE_ES_URL'),
    }
  });
})();
