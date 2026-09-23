import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioTarea from './FormularioTarea.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('FormularioTarea (HU-01)', () => {
  it('renderiza el formulario y la lista de tareas publicadas del docente', async () => {
    await renderAutenticado(<FormularioTarea />, { rol: 'DOCENTE' })
    expect(await screen.findByRole('heading', { name: 'Publicar tarea' })).toBeInTheDocument()
    expect(await screen.findByText('Maquetar formulario de contacto')).toBeInTheDocument()
  })

  it('rechaza una fecha límite en el pasado con un mensaje accesible (RF-002)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioTarea />, { rol: 'DOCENTE' })
    await screen.findByText('Maquetar formulario de contacto')

    await usuario.type(screen.getByLabelText('Título'), 'Tarea con fecha inválida')
    fireEvent.change(screen.getByLabelText('Fecha límite'), {
      target: { value: '2020-01-01T12:00' },
    })
    await usuario.click(screen.getByRole('button', { name: 'Publicar tarea' }))

    expect(
      await screen.findByText('La fecha límite debe ser posterior a la fecha actual'),
    ).toBeInTheDocument()
  })

  it('publica una tarea con fichero adjunto opcional (RF-001, TC.20)', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<FormularioTarea />, { rol: 'DOCENTE' })
    await screen.findByText('Maquetar formulario de contacto')

    await usuario.type(screen.getByLabelText('Título'), 'Tarea con enunciado')
    fireEvent.change(screen.getByLabelText('Fecha límite'), {
      target: { value: '2030-01-01T12:00' },
    })
    await usuario.upload(
      screen.getByLabelText('Fichero adjunto (opcional)'),
      new File(['%PDF'], 'enunciado.pdf', { type: 'application/pdf' }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Publicar tarea' }))

    expect(await screen.findByText('Tarea con enunciado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Descargar enunciado.pdf/ })).toBeInTheDocument()
  })
})
