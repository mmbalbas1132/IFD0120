import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import FormularioEntrega from './FormularioEntrega.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

function ConRuta() {
  return (
    <Routes>
      <Route path="/alumno/tareas/:tareaId/entregar" element={<FormularioEntrega />} />
    </Routes>
  )
}

describe('FormularioEntrega (HU-02)', () => {
  it('renderiza el formulario de entrega', async () => {
    await renderAutenticado(<ConRuta />, { rol: 'ALUMNO', ruta: '/alumno/tareas/t-1/entregar' })
    expect(await screen.findByRole('heading', { name: 'Entregar tarea' })).toBeInTheDocument()
  })

  it('registra una entrega dentro de plazo (RF-003/RF-004)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<ConRuta />, { rol: 'ALUMNO', ruta: '/alumno/tareas/t-1/entregar' })
    await screen.findByRole('heading', { name: 'Entregar tarea' })

    await usuario.type(
      screen.getByLabelText('Comentario (opcional si adjuntas fichero)'),
      'Entrega de prueba',
    )
    await usuario.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(await screen.findByText('Entregada dentro de plazo')).toBeInTheDocument()
  })
})
