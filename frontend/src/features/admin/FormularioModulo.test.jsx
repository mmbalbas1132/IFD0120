import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioModulo from './FormularioModulo.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('FormularioModulo (HU-05)', () => {
  it('lista los módulos existentes con sus unidades formativas', async () => {
    await renderAutenticado(<FormularioModulo />, { rol: 'ADMINISTRADOR' })
    // "MF0491_3" aparece tanto en la lista como en el <select> del selector de módulo destino.
    expect((await screen.findAllByText(/MF0491_3/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/UF1841/).length).toBeGreaterThan(0)
  })

  it('rechaza un código de módulo duplicado (RF-009)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioModulo />, { rol: 'ADMINISTRADOR' })
    await screen.findAllByText(/MF0491_3/)

    // "Código"/"Nombre"/"Horas" se repiten (formulario de módulo + de unidad formativa) — se toma
    // el primero, que corresponde al formulario de módulo.
    await usuario.type(screen.getAllByLabelText('Código')[0], 'MF0491_3')
    await usuario.type(screen.getAllByLabelText('Nombre')[0], 'Duplicado')
    await usuario.type(screen.getAllByLabelText('Horas')[0], '100')
    await usuario.click(screen.getByRole('button', { name: 'Crear módulo' }))

    expect(await screen.findByText('Ya existe un módulo con ese código')).toBeInTheDocument()
  })
})
