import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import MisCalificaciones from './MisCalificaciones.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('MisCalificaciones — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<MisCalificaciones />, { rol: 'ALUMNO' })
    await screen.findByText('Programación web en el entorno cliente')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
