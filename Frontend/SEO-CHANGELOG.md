SEO Audit & Build Changes

Date: 2026-05-15

Summary:
- Centralized Clinical SEO head and JSON-LD builders.
- Added build-time prerendering, `sitemap.xml` and `robots.txt` generation via `scripts/generate-sitemap.mjs` (hooked in `vite.config.js`).
- Integrated Lighthouse CI in GitHub Actions to check budgets.
- To reduce client bundle sizes, `recharts` and `@fullcalendar/*` have been externalized to UMD CDN builds (unpkg) and small ESM shim modules added in `src/libs/`.

## Option C: Corporate CDN (Recommended for Production)

### Why:
- Keeps bundle size small (only shims in bundle).
- Provides security: host UMDs on your corporate CDN instead of relying on unpkg.
- Supports offline/private networks if CDN is internal.
- Full control over library versions and fallbacks.

### Setup:

1. **Download the UMD files** to your CDN:
   ```bash
   mkdir -p /cdn/libs/{recharts,@fullcalendar}
   
   # Recharts 3.3.0
   wget -O /cdn/libs/recharts/3.3.0/umd/Recharts.min.js \
     https://unpkg.com/recharts@3.3.0/umd/Recharts.min.js
   
   # FullCalendar 6.1.20
   wget -O /cdn/libs/@fullcalendar/core/6.1.20/index.global.min.js \
     https://unpkg.com/@fullcalendar/core@6.1.20/index.global.min.js
   # (repeat for daygrid, timegrid, interaction, react, locales/es.global.min.js)
   ```

2. **Update `.env`** with your CDN URLs:
   ```env
   VITE_CDN_RECHARTS_URL=https://your-cdn.com/libs/recharts/3.3.0/umd/Recharts.min.js
   VITE_CDN_FULLCALENDAR_CORE_URL=https://your-cdn.com/libs/@fullcalendar/core/6.1.20/index.global.min.js
   # ... (see .env.example for all variables)
   ```

3. **The cdn-loader.js** automatically loads URLs from `.env` on startup, falling back to unpkg.com if not defined.

4. **CSP**: Update your Content-Security-Policy header to allow your CDN:
   ```
   script-src 'self' https://your-cdn.com ...
   ```

### Risks Mitigated:
- ✅ No dependency on unpkg.com (external public CDN).
- ✅ Full control over versions and fallbacks.
- ✅ Offline capability if CDN is internal.

---

## Option B: Bundled with Enhanced manualChunks (No External CDN)

### Why:
- No external CDN dependency; everything bundled locally.
- Simpler deployment; no .env configuration needed.
- Tradeoff: larger chunks, but still manageable if code-split properly.

### Implementation (Not active, documented for reference):

1. **Revert externalizations** in `index.html` and `vite.config.js`:
   - Remove alias entries for shims.
   - Remove cdn-loader.js.
   - Remove CDN script tags.

2. **Add aggressive manualChunks** in `vite.config.js`:
   ```javascript
   manualChunks(id) {
     // Split recharts submodules by component
     if (id.includes('recharts')) {
       if (id.includes('recharts/lib/components/LineChart')) return 'chart-line';
       if (id.includes('recharts/lib/components/AreaChart')) return 'chart-area';
       if (id.includes('recharts/lib/components/BarChart')) return 'chart-bar';
       // ... more specific splits
       return 'charts-common'; // fallback for recharts
     }
     
     // Split FullCalendar plugins into separate chunks
     if (id.includes('@fullcalendar/daygrid')) return 'calendar-daygrid';
     if (id.includes('@fullcalendar/timegrid')) return 'calendar-timegrid';
     if (id.includes('@fullcalendar/interaction')) return 'calendar-interaction';
     // ... rest of manualChunks logic
   }
   ```

3. **Lazy-load components** that use charts/calendar:
   - Already done: `MyCalendar.jsx`, `ProgressCharts.jsx`, etc. use dynamic imports.
   - Chunks load on-demand when routes are accessed.

4. **Expected result**: Recharts and FullCalendar split into 8-12 chunks of ~30-50 kB each instead of 1-2 bundles of 150-350 kB.

### Tradeoff:
- Higher number of HTTP requests on first dashboard load.
- Need to verify Core Web Vitals don't suffer from increased requests.

---

## Files Changed:
- [Frontend/index.html](Frontend/index.html) — updated to use cdn-loader.js
- [Frontend/vite.config.js](Frontend/vite.config.js) — aliases for shims
- [Frontend/src/libs/](Frontend/src/libs/) — shim modules
- [Frontend/public/cdn-loader.js](Frontend/public/cdn-loader.js) — dynamic CDN URL loader
- [Frontend/.env.example](Frontend/.env.example) — CDN configuration template
- [Frontend/package.json](Frontend/package.json) — added audit:lhci script

## Recommended Next Steps:
1. **Choose Option C or B** based on your deployment strategy.
2. **If Option C**: Update `.env` with your corporate CDN URLs and test in staging.
3. **If Option B**: Implement aggressive manualChunks and re-run `npm run build` to measure new chunk sizes.
4. **Run Lighthouse CI** in staging to validate Core Web Vitals impact.

## Security Checklist:
- ✅ CSP updated to allow CDN (if using Option C).
- ✅ Shims validate globals before use (`window.Recharts`, `window.FullCalendar`).
- ✅ Fallback to unpkg.com if corporate CDN unavailable (configurable).
- ✅ `robots.txt` and `sitemap.xml` exclude protected routes (clinical, auth, api, tools).
- ✅ Public routes only: homepage, services, crisis, evaluaciones, herramientas-tcc.

