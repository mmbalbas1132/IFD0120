// Helpers compartidos por las pruebas de componentes (TC.17) y de accesibilidad (TC.15): autentica
// un rol antes de renderizar para poder probar páginas protegidas sin repetir el flujo de login.
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { AuthProvider } from '../src/auth/AuthContext.jsx'
import { fijarAccessToken } from '../src/api/httpClient.js'
import { login } from '../src/api/authApi.js'

const CREDENCIALES_POR_ROL = {
  ADMINISTRADOR: 'admin@gestorfp.test',
  DOCENTE: 'docente1@gestorfp.test',
  ALUMNO: 'alumno1@gestorfp.test',
}

/** Inicia sesión (contra el mock) con el rol indicado antes de que el componente se monte. */
export async function autenticarComo(rol) {
  const { accessToken, usuario } = await login(CREDENCIALES_POR_ROL[rol], 'Password123!')
  fijarAccessToken(accessToken)
  return usuario
}

export function renderConRouter(ui, { ruta = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}

/** Renderiza `ui` ya autenticado como `rol`; espera a que AuthContext deje de "cargar". */
export async function renderAutenticado(ui, { rol, ruta = '/' } = {}) {
  if (rol) await autenticarComo(rol)
  const resultado = renderConRouter(ui, { ruta })
  await waitFor(() => {
    // Con la sesión ya iniciada antes de montar, /auth/refresh la confirma casi al instante.
  })
  return resultado
}

/** TC.15 — 0 violaciones críticas/serias de WCAG 2.2 AA (vitest-axe) en una página ya renderizada. */
export async function verificarSinViolacionesCriticas(container) {
  const resultados = await axe(container, {
    resultTypes: ['violations'],
  })
  const criticasOSerias = resultados.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact),
  )
  return criticasOSerias
}
