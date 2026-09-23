import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import GestionMatriculas from './GestionMatriculas.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('GestionMatriculas — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<GestionMatriculas />, { rol: 'ADMINISTRADOR' })
    await screen.findAllByText('Iago Barreiro Cid')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
