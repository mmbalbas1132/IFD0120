import { describe, it, expect, beforeEach } from 'vitest'
import { httpClient, put, fijarAccessToken, ErrorApi } from './httpClient.js'
import { login } from './authApi.js'

describe('httpClient', () => {
  beforeEach(() => {
    fijarAccessToken(null)
  })

  it('propaga un error 422 del mock como ErrorApi con status y message', async () => {
    const { accessToken } = await login('docente1@gestorfp.test', 'Password123!')
    fijarAccessToken(accessToken)

    await expect(put('/entregas/e-1/evaluacion', { calificacion: 12 })).rejects.toMatchObject({
      status: 422,
      message: 'La calificación debe estar entre 0 y 10',
    })
  })

  it('una mutación con X-CSRF-Token ausente/incorrecto se propaga como ErrorApi 403', async () => {
    const { accessToken } = await login('docente1@gestorfp.test', 'Password123!')
    fijarAccessToken(accessToken)
    // La cookie csrf_token correcta queda fijada por el login; se fuerza una cabecera que NO
    // coincide con ella para simular un intento sin CSRF válido (p. ej. una petición forjada).
    let capturado
    try {
      await httpClient('/entregas/e-1/evaluacion', {
        method: 'PUT',
        body: JSON.stringify({ calificacion: 8 }),
        headers: { 'X-CSRF-Token': 'no-coincide-con-la-cookie' },
      })
    } catch (error) {
      capturado = error
    }
    expect(capturado).toBeInstanceOf(ErrorApi)
    expect(capturado.status).toBe(403)
  })

  it('una mutación con X-CSRF-Token correcto (auto-inyectado desde la cookie) pasa', async () => {
    const { accessToken } = await login('docente1@gestorfp.test', 'Password123!')
    fijarAccessToken(accessToken)
    // Sin forzar cabecera: httpClient debe leer la cookie csrf_token y adjuntarla sola.
    const entrega = await put('/entregas/e-1/evaluacion', {
      calificacion: 9,
      observaciones: 'Correcto',
    })
    expect(entrega.estado).toBe('CALIFICADA')
    expect(entrega.evaluacion.calificacion).toBe(9)
  })

  it('inyecta Authorization con el access token en memoria', async () => {
    const { accessToken } = await login('admin@gestorfp.test', 'Password123!')
    fijarAccessToken(accessToken)
    const usuarios = await httpClient('/usuarios')
    expect(usuarios.contenido.length).toBeGreaterThan(0)
  })
})
