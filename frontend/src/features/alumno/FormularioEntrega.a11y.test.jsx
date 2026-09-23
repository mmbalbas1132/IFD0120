import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import FormularioEntrega from './FormularioEntrega.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

function ConRuta() {
  return (
    <Routes>
      <Route path="/alumno/tareas/:tareaId/entregar" element={<FormularioEntrega />} />
    </Routes>
  )
}

describe('FormularioEntrega — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<ConRuta />, {
      rol: 'ALUMNO',
      ruta: '/alumno/tareas/t-1/entregar',
    })
    await screen.findByRole('heading', { name: 'Entregar tarea' })
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
