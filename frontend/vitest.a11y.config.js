import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config dedicada para `npm run test:a11y`: solo ejecuta las pruebas *.a11y.test.jsx
// (TC.15 — pasada de accesibilidad WCAG 2.2 AA con vitest-axe sobre páginas completas).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    css: true,
    include: ['**/*.a11y.test.jsx'],
  },
})
