import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TC.19: `public/mockServiceWorker.js` solo sirve a MSW en `npm run dev`; Vite copia `public/`
// entero al build, así que se elimina del resultado para no publicar artefactos del mock.
function excluirWorkerMsw() {
  let outDir
  return {
    name: 'gestorfp:excluir-worker-msw',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await rm(resolve(outDir, 'mockServiceWorker.js'), { force: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), excluirWorkerMsw()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.a11y.test.jsx'],
  },
})
