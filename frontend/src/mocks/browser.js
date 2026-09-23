// Arranque de MSW en el navegador (npm run dev). Se desactivará en 003-implantacion apuntando a
// la API real mediante VITE_API_BASE_URL — ver frontend/README.md.
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers/index.js'

export const worker = setupWorker(...handlers)
