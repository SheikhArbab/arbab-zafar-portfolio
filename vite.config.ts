import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000,
    // Never inline fonts as data: URIs; the CSP only allows same-origin fonts (font-src 'self').
    assetsInlineLimit: (file: string) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
  },
  ssr: { noExternal: ['framer-motion'] },
  // Canonical site URL from the build env, so client-side revalidation can't swap canonicals.
  define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(process.env.SITE_URL ?? '') },
})
