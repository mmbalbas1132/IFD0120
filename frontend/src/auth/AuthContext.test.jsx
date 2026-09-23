import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import RutaProtegida from './RutaProtegida.jsx'

function PaginaLogin() {
  const { iniciarSesion } = useAuth()
  return (
    <button onClick={() => iniciarSesion('admin@gestorfp.test', 'Password123!')}>
      Entrar como admin
    </button>
  )
}

function PaginaAdmin() {
  return <h1>Panel administración</h1>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PaginaLogin />} />
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
              <PaginaAdmin />
            </RutaProtegida>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

describe('AuthContext + RutaProtegida', () => {
  it('redirige /admin a /login cuando no hay sesión ADMINISTRADOR', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Entrar como admin')).toBeInTheDocument())
    expect(screen.queryByText('Panel administración')).not.toBeInTheDocument()
  })

  it('tras "recargar la página" (remontar AuthProvider), la sesión se recupera vía /auth/refresh sin pedir credenciales', async () => {
    const usuario = userEvent.setup()
    const { unmount } = render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )
    await usuario.click(screen.getByText('Entrar como admin'))

    // "Recargar la página": se pierde el estado de React (access token en memoria), pero la
    // cookie refresh_token simulada sigue en document.cookie (persiste entre renders, igual que
    // en un navegador real).
    unmount()

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Panel administración')).toBeInTheDocument())
  })
})
