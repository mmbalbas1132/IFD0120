import { describe, it, expect } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GestionMatriculas from './GestionMatriculas.jsx'
import { renderAutenticado } from '../../../tests/utils.jsx'

describe('GestionMatriculas (HU-05)', () => {
  it('lista las matrículas activas agrupadas por módulo', async () => {
    await renderAutenticado(<GestionMatriculas />, { rol: 'ADMINISTRADOR' })
    // Iago está matriculado en 2 módulos → aparece 2 veces como <span>, más otra en el <select>.
    expect((await screen.findAllByText('Iago Barreiro Cid')).length).toBeGreaterThanOrEqual(2)
  })

  it('da de baja una matrícula existente', async () => {
    const usuario = userEvent.setup()
    await renderAutenticado(<GestionMatriculas />, { rol: 'ADMINISTRADOR' })
    await screen.findAllByText('Noa Domínguez Rey')

    // "Noa Domínguez Rey" también aparece como texto de una <option> del selector de alumno;
    // se toma específicamente el <span> de la fila de matrícula (el único con un <li> ancestro).
    const filaNoa = screen
      .getAllByText('Noa Domínguez Rey')
      .map((el) => el.closest('li'))
      .find(Boolean)
    await usuario.click(within(filaNoa).getByRole('button', { name: 'Dar de baja' }))

    // Tras la baja solo queda la mención de "Noa Domínguez Rey" en la <option> del selector de
    // alumno (sigue activa como usuaria), no ya en ninguna fila de matrícula.
    await waitFor(() => {
      expect(screen.getAllByText('Noa Domínguez Rey')).toHaveLength(1)
    })
  })
})
