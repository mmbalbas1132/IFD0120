import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import PaginaLogin from './PaginaLogin.jsx'
import { renderConRouter, verificarSinViolacionesCriticas } from '../../tests/utils.jsx'

describe('PaginaLogin — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = renderConRouter(<PaginaLogin />)
    await screen.findByRole('heading', { name: 'Acceder a GestorFP' })
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
