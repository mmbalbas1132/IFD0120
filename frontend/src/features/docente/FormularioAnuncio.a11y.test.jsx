import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import FormularioAnuncio from './FormularioAnuncio.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('FormularioAnuncio — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<FormularioAnuncio />, { rol: 'DOCENTE' })
    await screen.findByText('Cambio de aula')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
