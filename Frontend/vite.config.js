import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { generateSeoArtifacts } from '../scripts/generate-sitemap.mjs'

// https://vitejs.dev/config/
// Force redeploy to update custom domains
const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'seo-clinical-prerender',
      apply: 'build',
      async closeBundle() {
        await generateSeoArtifacts({
          distDir: resolve(rootDir, 'dist'),
        })
      },
    },
  ],
  resolve: {
    alias: {
      'recharts': resolve(rootDir, 'src/libs/recharts-shim.js'),
      '@fullcalendar/react': resolve(rootDir, 'src/libs/fullcalendar-react-shim.js'),
      '@fullcalendar/daygrid': resolve(rootDir, 'src/libs/fullcalendar-daygrid-shim.js'),
      '@fullcalendar/timegrid': resolve(rootDir, 'src/libs/fullcalendar-timegrid-shim.js'),
      '@fullcalendar/interaction': resolve(rootDir, 'src/libs/fullcalendar-interaction-shim.js'),
      '@fullcalendar/core/locales/es': resolve(rootDir, 'src/libs/fullcalendar-locales-es-shim.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 150,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          const normalizedId = id.replace(/\\/g, '/')

          if (id.includes('react-router-dom')) {
            return 'router'
          }

          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-core'
          }

          const packageMatch = normalizedId.match(/node_modules\/(?:\.pnpm\/)?((?:@[^/]+\/[^/]+)|[^/]+)/)

          if (!packageMatch) {
            return 'vendor'
          }

          const packageName = packageMatch[1]
            .replace(/^@/, '')
            .replace(/\//g, '-')

          if (packageName === 'react-toastify' || packageName === 'react-icons' || packageName === 'react-spinners' || packageName === 'swiper') {
            return `ui-${packageName}`
          }

          if (packageName === 'react-helmet-async' || packageName === '@react-oauth-google' || packageName === '@hcaptcha-react-hcaptcha' || packageName === 'jwt-decode' || packageName === 'date-fns') {
            return `core-${packageName}`
          }

          return `pkg-${packageName}`
        },
      },
    },
  },
})
