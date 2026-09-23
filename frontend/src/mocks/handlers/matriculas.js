import { http, HttpResponse } from 'msw'
import { db, generarId } from '../db.js'
import {
  BASE,
  csrfValido,
  noAutenticado,
  sinPermiso,
  noEncontrado,
  validacion,
  obtenerSesion,
} from './utils.js'

export const matriculasHandlers = [
  http.post(`${BASE}/matriculas`, async ({ request }) => {
    const path = '/api/v1/matriculas'
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { alumnoId, moduloId } = cuerpo || {}
    if (!alumnoId || !moduloId) return validacion('alumnoId y moduloId son obligatorios', path)

    const alumno = db.usuarios.find((u) => u.id === alumnoId && u.rol === 'ALUMNO')
    if (!alumno) return validacion('El alumno indicado no existe', path)
    const modulo = db.modulos.find((m) => m.id === moduloId)
    if (!modulo) return validacion('El módulo indicado no existe', path)

    const nueva = {
      id: generarId('mat'),
      alumnoId,
      moduloId,
      fechaMatricula: new Date().toISOString().slice(0, 10),
      estado: 'ACTIVA',
    }
    db.matriculas.push(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.delete(`${BASE}/matriculas/:id`, ({ request, params }) => {
    const path = `/api/v1/matriculas/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const matricula = db.matriculas.find((m) => m.id === params.id)
    if (!matricula) return noEncontrado(path)
    matricula.estado = 'BAJA'
    return new HttpResponse(null, { status: 204 })
  }),
]
