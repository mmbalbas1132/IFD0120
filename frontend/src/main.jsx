import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import './styles/variables.css'
import './styles/base.css'
import './styles/tailwind.css'

async function activarMocks() {
  // Solo en `npm run dev`: 003-implantacion desactivará esto apuntando a la API real
  // (ver frontend/README.md). `import.meta.env.MODE` es constante en tiempo de build, así que en
  // `npm run build` Vite elimina el import dinámico y el mock (con sus credenciales simuladas)
  // nunca llega al bundle de producción (TC.19). Se usa MODE y no DEV porque DEV depende de
  // NODE_ENV: con NODE_ENV≠production heredado del entorno, un `vite build` incluiría el mock.
  if (import.meta.env.MODE !== 'development') return
  if (import.meta.env.VITE_API_BASE_URL) return // API real configurada: no arrancar el mock
  const { worker } = await import('./mocks/browser.js')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

activarMocks().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
})
