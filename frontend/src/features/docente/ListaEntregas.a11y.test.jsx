import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import ListaEntregas from './ListaEntregas.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

function ConRuta() {
  return (
    <Routes>
      <Route path="/docente/tareas/:tareaId/entregas" element={<ListaEntregas />} />
    </Routes>
  )
}

describe('ListaEntregas — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<ConRuta />, {
      rol: 'DOCENTE',
      ruta: '/docente/tareas/t-2/entregas',
    })
    await screen.findByText('Calificada')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
