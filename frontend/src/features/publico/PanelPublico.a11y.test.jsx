import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import PanelPublico from './PanelPublico.jsx'
import { renderConRouter, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('PanelPublico — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = renderConRouter(<PanelPublico />)
    await screen.findByText('Programación web en el entorno cliente')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
