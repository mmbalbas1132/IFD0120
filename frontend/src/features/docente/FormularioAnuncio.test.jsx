import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioAnuncio from './FormularioAnuncio.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('FormularioAnuncio (HU-08)', () => {
  it('renderiza el formulario y los anuncios ya publicados', async () => {
    await renderAutenticado(<FormularioAnuncio />, { rol: 'DOCENTE' })
    expect(await screen.findByText('Cambio de aula')).toBeInTheDocument()
  })

  it('publica un anuncio marcado como destacado', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioAnuncio />, { rol: 'DOCENTE' })
    await screen.findByText('Cambio de aula')

    await usuario.type(screen.getByLabelText('Título'), 'Examen adelantado')
    await usuario.type(screen.getByLabelText('Contenido'), 'El examen se adelanta al viernes.')
    await usuario.click(screen.getByLabelText('Marcar como destacado'))
    await usuario.click(screen.getByRole('button', { name: 'Publicar anuncio' }))

    expect(await screen.findByText('Examen adelantado')).toBeInTheDocument()
  })
})
