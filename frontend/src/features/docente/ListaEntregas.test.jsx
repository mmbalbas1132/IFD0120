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

    expect(await screen.findByText('La calificación debe estar entre 0 y 10')).toBeInTheDocument()
  })

  it('muestra el historial con la nota anterior y la nueva tras editar (RF-016, TC.22)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<ConRuta />, { rol: 'DOCENTE', ruta: '/docente/tareas/t-2/entregas' })
    await screen.findByText('Calificada')

    await usuario.click(screen.getByRole('button', { name: 'Editar calificación' }))
    const campo = screen.getByLabelText('Calificación (0–10)')
    await usuario.clear(campo)
    await usuario.type(campo, '9')
    await usuario.click(screen.getByRole('button', { name: 'Guardar calificación' }))
    await screen.findByText(/Nota actual: 9/)

    await usuario.click(screen.getByRole('button', { name: 'Ver historial' }))
    const historial = await screen.findByRole('list', { name: 'Historial de la calificación' })
    const cambios = historial.querySelectorAll('li')
    expect(cambios).toHaveLength(2)
    expect(cambios[0]).toHaveTextContent(/Marcos Iglesias Pena: 8.5 .* → 9/)
    expect(cambios[1]).toHaveTextContent(/sin calificar → 8.5/)
  })
})
