import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import TablaUsuarios from './TablaUsuarios.jsx'
import { renderAutenticado, verificarSinViolacionesCriticas } from '../../../tests/utils.jsx'

describe('TablaUsuarios — accesibilidad WCAG 2.2 AA (TC.15)', () => {
  it('no tiene violaciones críticas/serias', async () => {
    const { container } = await renderAutenticado(<TablaUsuarios />, { rol: 'ADMINISTRADOR' })
    await screen.findByText('admin@gestorfp.test')
    expect(await verificarSinViolacionesCriticas(container)).toEqual([])
  })
})
