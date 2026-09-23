import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import MisCalificaciones from './MisCalificaciones.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('MisCalificaciones (HU-04)', () => {
  it('muestra únicamente las calificaciones propias, agrupadas por módulo', async () => {
    await renderAutenticado(<MisCalificaciones />, { rol: 'ALUMNO' })
    expect(await screen.findByText('Programación web en el entorno cliente')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('no muestra calificaciones de otro alumno', async () => {
    await renderAutenticado(<MisCalificaciones />, { rol: 'ALUMNO' })
    await screen.findByText('Programación web en el entorno cliente')
    // e-3 (entrega fuera de plazo de u-alumno-2) no debe aparecer en la vista de u-alumno-1.
    expect(screen.queryByText('Entrega tardía por incidencia técnica.')).not.toBeInTheDocument()
  })
})
