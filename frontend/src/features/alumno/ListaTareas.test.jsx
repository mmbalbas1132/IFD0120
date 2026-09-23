import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListaTareas from './ListaTareas.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('ListaTareas (HU-02, precondición)', () => {
  it('lista las tareas de la unidad formativa seleccionada', async () => {
    await renderAutenticado(<ListaTareas />, { rol: 'ALUMNO' })
    expect(await screen.findByText('Maquetar formulario de contacto')).toBeInTheDocument()
  })

  it('cambia de unidad formativa con el selector', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<ListaTareas />, { rol: 'ALUMNO' })
    await screen.findByText('Maquetar formulario de contacto')

    await usuario.selectOptions(screen.getByLabelText('Unidad formativa'), 'uf-4') // UF1844
    expect(await screen.findByText('Interfaz de escritorio con formularios')).toBeInTheDocument()
  })
})
