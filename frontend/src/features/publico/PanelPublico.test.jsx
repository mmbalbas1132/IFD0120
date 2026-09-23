import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import PanelPublico from './PanelPublico.jsx'
import { renderConRouter } from '../../../tests/utils.jsx'

describe('PanelPublico (HU-06)', () => {
  it('lista los módulos sin necesidad de autenticación', async () => {
    renderConRouter(<PanelPublico />)
    expect(
      await screen.findByText('Programación web en el entorno cliente'),
    ).toBeInTheDocument()
  })

  it('no muestra ningún dato personal de alumnado', async () => {
    renderConRouter(<PanelPublico />)
    await screen.findByText('Programación web en el entorno cliente')
    expect(screen.queryByText(/@gestorfp\.test/)).not.toBeInTheDocument()
  })
})
