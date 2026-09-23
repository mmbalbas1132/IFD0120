import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import FormularioTarea from './FormularioTarea.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('FormularioTarea — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<FormularioTarea />, { rol: 'DOCENTE' })
    await screen.findByText('Maquetar formulario de contacto')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
