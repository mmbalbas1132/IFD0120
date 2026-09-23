import { describe, it, expect } from 'vitest'
import { crearEntrega } from '../../api/entregasApi.js'
import { calificarEntrega, listarHistorialEvaluacion } from '../../api/evaluacionesApi.js'
import { autenticarComo } from '../../../tests/utils.jsx'

describe('entregas en el mock (RF-003, RF-016)', () => {
  it('reemplaza la entrega no calificada en lugar de crear otra (TC.21)', async () => {
    await autenticarComo('ALUMNO')
    const reemplazo = await crearEntrega('t-1', { comentario: 'Versión 2' })
    expect(reemplazo).toMatchObject({ id: 'e-2', comentario: 'Versión 2' })
  })

  it('rechaza con 409 reemplazar una entrega ya calificada (TC.21)', async () => {
    await autenticarComo('ALUMNO')
    await expect(crearEntrega('t-2', { comentario: 'Otra vez' })).rejects.toMatchObject({
      status: 409,
      message: 'La entrega ya está calificada y no se puede reemplazar',
    })
  })

  it('guarda cada cambio de calificación en el historial, del más reciente al más antiguo (TC.22)', async () => {
    await autenticarComo('DOCENTE')
    await calificarEntrega('e-1', { calificacion: 9, observaciones: 'Tras revisión' })

    const historial = await listarHistorialEvaluacion('e-1')
    expect(historial).toHaveLength(2)
    expect(historial[0]).toMatchObject({
      calificacionAnterior: 8.5,
      calificacionNueva: 9,
      observacionesNuevas: 'Tras revisión',
      autorCambioId: 'u-docente-1',
    })
    expect(historial[1]).toMatchObject({ calificacionAnterior: null, calificacionNueva: 8.5 })
  })

  it('no deja ver el historial al alumnado (RF-016)', async () => {
    await autenticarComo('ALUMNO')
    await expect(listarHistorialEvaluacion('e-1')).rejects.toMatchObject({ status: 403 })
  })
})
