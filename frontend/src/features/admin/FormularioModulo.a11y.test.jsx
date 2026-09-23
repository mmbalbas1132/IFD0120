import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import FormularioModulo from './FormularioModulo.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('FormularioModulo — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<FormularioModulo />, { rol: 'ADMINISTRADOR' })
    await screen.findAllByText(/MF0491_3/)
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
