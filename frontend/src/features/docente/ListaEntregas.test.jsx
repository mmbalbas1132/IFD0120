import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import ListaEntregas from './ListaEntregas.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

function ConRuta() {
  return (
    <Routes>
      <Route path="/docente/tareas/:tareaId/entregas" element={<ListaEntregas />} />
    </Routes>
  )
}

describe('ListaEntregas + FormularioCalificacion (HU-03)', () => {
  it('lista las entregas de la tarea con su estado', async () => {
    await renderAutenticado(<ConRuta />, { rol: 'DOCENTE', ruta: '/docente/tareas/t-2/entregas' })
    expect(await screen.findByText('Calificada')).toBeInTheDocument()
    expect(await screen.findByText('Fuera de plazo')).toBeInTheDocument()
  })

  it('rechaza una calificación fuera de rango antes de enviarla (RF-006)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<ConRuta />, { rol: 'DOCENTE', ruta: '/docente/tareas/t-2/entregas' })
    await screen.findByText('Fuera de plazo')

    await usuario.click(screen.getByRole('button', { name: 'Calificar' }))
    await usuario.type(screen.getByLabelText('Calificación (0–10)'), '12')
    await usuario.click(screen.getByRole('button', { name: 'Guardar calificación' }))

    expect(
      await screen.findByText('La calificación debe estar entre 0 y 10'),
    ).toBeInTheDocument()
  })
})
