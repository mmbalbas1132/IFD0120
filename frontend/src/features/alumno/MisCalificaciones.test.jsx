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

  it('envuelve cada tabla en una región desplazable accesible por teclado (TC.16)', async () => {
    await renderAutenticado(<MisCalificaciones />, { rol: 'ALUMNO' })
    const region = await screen.findByRole('region', {
      name: 'Calificaciones de Programación web en el entorno cliente',
    })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toContainElement(screen.getByRole('table'))
  })

  it('no muestra calificaciones de otro alumno', async () => {
    await renderAutenticado(<MisCalificaciones />, { rol: 'ALUMNO' })
    await screen.findByText('Programación web en el entorno cliente')
    // e-3 (entrega fuera de plazo de u-alumno-2) no debe aparecer en la vista de u-alumno-1.
    expect(screen.queryByText('Entrega tardía por incidencia técnica.')).not.toBeInTheDocument()
  })
})
