import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import PaginaCambiarPassword from './PaginaCambiarPassword.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../tests/utils.jsx'

describe('PaginaCambiarPassword — accesibilidad WCAG 2.2 AA (TC.15, TC.23)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<PaginaCambiarPassword />, { rol: 'ALUMNO' })
    await screen.findByRole('heading', { name: 'Cambiar contraseña' })
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
