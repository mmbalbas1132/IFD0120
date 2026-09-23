import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import FormularioEntrega from './FormularioEntrega.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

// Fixtures de alumno1: sin entrega en t-3, entrega sin calificar en t-1 y calificada en t-2.
function ConRuta() {
  return (
    <Routes>
      <Route path="/alumno/tareas/:tareaId/entregar" element={<FormularioEntrega />} />
    </Routes>
  )
}

function renderTarea(tareaId) {
  return renderAutenticado(<ConRuta />, {
    rol: 'ALUMNO',
    ruta: `/alumno/tareas/${tareaId}/entregar`,
  })
}

const ETIQUETA_FICHERO = 'Fichero (opcional si añades comentario)'

describe('FormularioEntrega (HU-02)', () => {
  it('renderiza el formulario de entrega', async () => {
    await renderTarea('t-3')
    expect(await screen.findByRole('heading', { name: 'Entregar tarea' })).toBeInTheDocument()
  })

  it('registra una entrega con fichero dentro de plazo (RF-003/RF-004, RNF-014)', async () => {
    const usuario = userEvent.setup()
    await renderTarea('t-3')
    const fichero = new File(['contenido'], 'calendario.zip', { type: 'application/zip' })

    await usuario.upload(await screen.findByLabelText(ETIQUETA_FICHERO), fichero)
    await usuario.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(await screen.findByRole('heading', { name: 'Entrega registrada' })).toBeInTheDocument()
    expect(screen.getByText('Entregada dentro de plazo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Descargar calendario\.zip/ })).toBeInTheDocument()
  })

  it('reemplaza una entrega todavía no calificada (RF-003)', async () => {
    const usuario = userEvent.setup()
    await renderTarea('t-1')

    expect(await screen.findByText(/Ya entregaste esta tarea/)).toBeInTheDocument()
    await usuario.type(
      screen.getByLabelText('Comentario (opcional si adjuntas fichero)'),
      'Versión corregida',
    )
    await usuario.click(screen.getByRole('button', { name: 'Reemplazar entrega' }))

    expect(await screen.findByRole('heading', { name: 'Entrega reemplazada' })).toBeInTheDocument()
  })

  it('no permite reemplazar una entrega ya calificada (RF-003)', async () => {
    await renderTarea('t-2')
    expect(
      await screen.findByText(/ya está calificada y no se puede reemplazar/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /entrega/i })).not.toBeInTheDocument()
  })

  it('rechaza en cliente un fichero de más de 10 MB sin enviarlo (RNF-014)', async () => {
    const usuario = userEvent.setup()
    await renderTarea('t-3')
    const grande = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'video.zip', {
      type: 'application/zip',
    })

    await usuario.upload(await screen.findByLabelText(ETIQUETA_FICHERO), grande)
    await usuario.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(await screen.findByText('El fichero no puede superar los 10 MB')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Entrega registrada' })).not.toBeInTheDocument()
  })

  it('rechaza en cliente un tipo de fichero no permitido (RNF-014)', async () => {
    // applyAccept:false simula a quien se salta el filtro `accept` del selector de ficheros.
    const usuario = userEvent.setup({ applyAccept: false })
    await renderTarea('t-3')
    const ejecutable = new File(['MZ'], 'programa.exe', { type: 'application/octet-stream' })

    await usuario.upload(await screen.findByLabelText(ETIQUETA_FICHERO), ejecutable)
    await usuario.click(screen.getByRole('button', { name: 'Confirmar entrega' }))

    expect(await screen.findByText(/Tipo de fichero no permitido/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Entrega registrada' })).not.toBeInTheDocument()
  })
})
