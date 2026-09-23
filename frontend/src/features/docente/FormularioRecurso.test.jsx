import { afterEach, describe, it, expect, vi } from 'vitest'
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

  it('publica un DOCUMENTO con fichero en lugar de URL (RF-012, TC.20)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })
    await screen.findByText('MDN - Fetch API')

    await usuario.selectOptions(screen.getByLabelText('Tipo'), 'DOCUMENTO')
    expect(screen.queryByLabelText('URL')).not.toBeInTheDocument()
    await usuario.type(screen.getByLabelText('Título'), 'Apuntes de Flexbox')
    await usuario.upload(
      screen.getByLabelText('Fichero'),
      new File(['%PDF'], 'flexbox.pdf', { type: 'application/pdf' }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Publicar recurso' }))

    expect(await screen.findByRole('button', { name: /Descargar flexbox.pdf/ })).toBeInTheDocument()
  })

  it('exige fichero a un DOCUMENTO antes de enviar (RF-012)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })
    await screen.findByText('MDN - Fetch API')

    await usuario.selectOptions(screen.getByLabelText('Tipo'), 'DOCUMENTO')
    await usuario.type(screen.getByLabelText('Título'), 'Sin fichero')
    await usuario.click(screen.getByRole('button', { name: 'Publicar recurso' }))

    expect(
      await screen.findByText('Un recurso de tipo DOCUMENTO necesita un fichero'),
    ).toBeInTheDocument()
  })

  it('descarga el fichero de un DOCUMENTO con la sesión del usuario (RNF-014)', async () => {
    // jsdom no implementa URL.createObjectURL: se simula para comprobar qué se entrega al navegador.
    const crear = vi.fn(() => 'blob:simulado')
    const revocar = vi.fn()
    URL.createObjectURL = crear
    URL.revokeObjectURL = revocar
    const clicEnlace = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioRecurso />, { rol: 'DOCENTE' })

    await usuario.click(
      await screen.findByRole('button', { name: /Descargar guia-formularios-accesibles.pdf/ }),
    )

    await vi.waitFor(() => expect(crear).toHaveBeenCalledTimes(1))
    expect(await crear.mock.calls[0][0].text()).toMatch(/^%PDF/)
    expect(clicEnlace).toHaveBeenCalledTimes(1)
    expect(revocar).toHaveBeenCalledWith('blob:simulado')
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  delete URL.createObjectURL
  delete URL.revokeObjectURL
})
