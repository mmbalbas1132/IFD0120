import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import FormularioRecurso from './FormularioRecurso.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('FormularioRecurso — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })
    await screen.findByText('MDN - Fetch API')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
