import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import PaginaCambiarPassword from './PaginaCambiarPassword.jsx'
import RutaProtegida from './RutaProtegida.jsx'
import { login } from '../api/authApi.js'
import { fijarAccessToken } from '../api/httpClient.js'
import { restablecerPassword } from '../api/usuariosApi.js'
import { autenticarComo, renderAutenticado, renderConRouter } from '../../tests/utils.jsx'

function Aplicacion() {
  return (
    <Routes>
      <Route
        path="/cambiar-password"
        element={
          <RutaProtegida>
            <PaginaCambiarPassword />
          </RutaProtegida>
        }
      />
      <Route
        path="/alumno/tareas"
        element={
          <RutaProtegida rolesPermitidos={['ALUMNO']}>
            <h1>Mis tareas</h1>
          </RutaProtegida>
        }
      />
    </Routes>
  )
}

async function rellenar(usuario, actual, nueva, repetida = nueva) {
  await usuario.type(screen.getByLabelText(/Contraseña (actual|temporal)/), actual)
  await usuario.type(screen.getByLabelText('Nueva contraseña'), nueva)
  await usuario.type(screen.getByLabelText('Repite la nueva contraseña'), repetida)
  await usuario.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
}

describe('PaginaCambiarPassword (RF-018, TC.23)', () => {
  it('cambia la contraseña de forma voluntaria', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<Aplicacion />, { rol: 'ALUMNO', ruta: '/cambiar-password' })
    await screen.findByRole('heading', { name: 'Cambiar contraseña' })

    await rellenar(usuario, 'Password123!', 'NuevaClave1!')

    expect(await screen.findByText('Contraseña cambiada correctamente.')).toBeInTheDocument()
  })

  it('valida las reglas de RF-018 en cliente antes de enviar', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<Aplicacion />, { rol: 'ALUMNO', ruta: '/cambiar-password' })
    await screen.findByRole('heading', { name: 'Cambiar contraseña' })

    await rellenar(usuario, 'Password123!', 'sinmayuscula1!')

    expect(
      await screen.findByText('La contraseña debe incluir al menos una mayúscula'),
    ).toBeInTheDocument()
  })

  it('avisa si las dos contraseñas nuevas no coinciden', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<Aplicacion />, { rol: 'ALUMNO', ruta: '/cambiar-password' })
    await screen.findByRole('heading', { name: 'Cambiar contraseña' })

    await rellenar(usuario, 'Password123!', 'NuevaClave1!', 'OtraClave1!')

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('con una contraseña temporal, obliga a cambiarla antes de entrar (RF-017)', async () => {
    const usuario = userEvent.setup()
    await autenticarComo('ADMINISTRADOR')
    const { passwordTemporal } = await restablecerPassword('u-alumno-1')
    const { accessToken } = await login('alumno1@gestorfp.test', passwordTemporal)
    fijarAccessToken(accessToken)

    renderConRouter(<Aplicacion />, { ruta: '/alumno/tareas' })

    expect(await screen.findByText(/Estás usando una contraseña temporal/)).toBeInTheDocument()
    await rellenar(usuario, passwordTemporal, 'NuevaClave1!')
    expect(await screen.findByRole('heading', { name: 'Mis tareas' })).toBeInTheDocument()
  })
})
