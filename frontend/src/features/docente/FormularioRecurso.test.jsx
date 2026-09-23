import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioRecurso from './FormularioRecurso.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('FormularioRecurso (HU-07)', () => {
  it('renderiza el formulario y los recursos ya publicados', async () => {
    await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })
    expect(await screen.findByText('MDN - Fetch API')).toBeInTheDocument()
  })

  it('publica un recurso de tipo ENLACE y lo añade al listado', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })
    await screen.findByText('MDN - Fetch API')

    await usuario.type(screen.getByLabelText('Título'), 'Recorrido por CSS Grid')
    await usuario.type(screen.getByLabelText('URL'), 'https://example.org/css-grid')
    await usuario.click(screen.getByRole('button', { name: 'Publicar recurso' }))

    expect(await screen.findByText('Recorrido por CSS Grid')).toBeInTheDocument()
  })
})
