Title: SEO + Bundle optimizations with configurable CDN support (Option C) or manualChunks (Option B)

Summary:
- Centralized Clinical SEO head & JSON-LD builders.
- Prerendering during build: generates `sitemap.xml` and `robots.txt` for public routes.
- Integrated Lighthouse CI (existing workflow) and added local `npm run audit:lhci` script.
- **Option C (Recommended):** Reduced client bundle sizes by externalizing `recharts` and `@fullcalendar/*` to UMD CDN builds with environment-based configuration. Host UMDs on your corporate CDN for security and offline support.
- **Option B (Alternative):** Document strategy for bundling with aggressive `manualChunks` if you prefer no external CDN dependency.
- Fixed dynamic/static import conflict for `CrisisPage` by lazy-loading `Emergency.jsx`.

## Options Overview:

### Option C: Corporate CDN (Active in this PR)
- **Pros:** Small bundle size, full control over CDN, security, offline support for corporate CDN.
- **Setup:** Configure `VITE_CDN_*` variables in `.env` (see `.env.example`), host UMD files on your CDN.
- **Effort:** Low; already implemented with fallback to unpkg.com.
- **Files:** `cdn-loader.js` dynamically loads URLs from environment.

### Option B: Bundled with manualChunks (Documented alternative)
- **Pros:** No external CDN dependency; simpler deployment.
- **Tradeoff:** Larger chunks (~30-50 kB each) but code-split granularly.
- **Setup:** Revert externalizations, add aggressive manualChunks in `vite.config.js`, relies on lazy-loading.
- **Effort:** Medium; requires careful bundling strategy validation.
- **See:** [SEO-CHANGELOG.md](Frontend/SEO-CHANGELOG.md#option-b-bundled-with-enhanced-manualchunks-no-external-cdn) for implementation details.

Files changed/added:
- [Frontend/index.html](Frontend/index.html) — uses cdn-loader.js instead of hardcoded scripts.
- [Frontend/vite.config.js](Frontend/vite.config.js) — aliases for shims, manualChunks.
- [Frontend/src/libs/](Frontend/src/libs/) — shim modules (recharts, fullcalendar).
- [Frontend/public/cdn-loader.js](Frontend/public/cdn-loader.js) — environment-based CDN URL loader.
- [Frontend/.env.example](Frontend/.env.example) — CDN configuration template (new section added).
- [Frontend/src/pages/Emergency.jsx](Frontend/src/pages/Emergency.jsx) — lazy wrapper for CrisisPage.
- [Frontend/SEO-CHANGELOG.md](Frontend/SEO-CHANGELOG.md) — detailed docs for Option C and Option B.
- [Frontend/package.json](Frontend/package.json) — added `audit:lhci` script.

Security & CSP:
- CSP updated to allow CDN scripts (configurable via `.env`).
- Option C: CSP allows your corporate CDN URL.
- Option B: No external scripts; CSP remains strict.
- Shims safely check globals before use.

Lighthouse CI:
- Local `npm run audit:lhci` script included; reports uploaded to temporary-public-storage.
- Five prerendered public routes audited: home, services, crisis, evaluaciones, herramientas-tcc.

## Decision:
- **If proceeding with Option C:** Update `.env` with corporate CDN URLs and host UMD files.
- **If preferring Option B:** Revert shims/cdn-loader.js and implement manualChunks strategy (documented in SEO-CHANGELOG.md).
- **Recommended:** Option C for security and control; simpler than managing 12+ chunks.

Suggested reviewers: frontend lead, security (CSP), DevOps (CDN setup if Option C).

