import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TablaUsuarios from './TablaUsuarios.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('TablaUsuarios (HU-05)', () => {
  it('lista el alumnado/docencia existente', async () => {
    await renderAutenticado(<TablaUsuarios />, { rol: 'ADMINISTRADOR' })
    expect(await screen.findByText('admin@gestorfp.test')).toBeInTheDocument()
    expect(screen.getByText('docente1@gestorfp.test')).toBeInTheDocument()
  })

  it('envuelve la tabla en una región desplazable accesible por teclado (TC.16)', async () => {
    await renderAutenticado(<TablaUsuarios />, { rol: 'ADMINISTRADOR' })
    const region = await screen.findByRole('region', { name: 'Listado de usuarios' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toContainElement(screen.getByRole('table'))
  })

  it('crea un usuario y lo añade a la tabla', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<TablaUsuarios />, { rol: 'ADMINISTRADOR' })
    await screen.findByText('admin@gestorfp.test')

    await usuario.type(screen.getByLabelText('Nombre'), 'Nuevo')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Alumno')
    await usuario.type(screen.getByLabelText('Email'), 'nuevo.alumno@gestorfp.test')
    await usuario.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByText('nuevo.alumno@gestorfp.test')).toBeInTheDocument()
  })
})
