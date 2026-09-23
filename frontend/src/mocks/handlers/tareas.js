import { http, HttpResponse } from 'msw'
import { db, generarId } from '../db.js'
import { alumnoMatriculadoEnModulo } from '../fixtures/modulos.js'
import {
  BASE,
  csrfValido,
  noAutenticado,
  sinPermiso,
  noEncontrado,
  validacion,
  reglaNegocio,
  obtenerSesion,
} from './utils.js'

function unidadConModulo(unidadFormativaId) {
  const unidad = db.unidadesFormativas.find((uf) => uf.id === unidadFormativaId)
  if (!unidad) return null
  const modulo = db.modulos.find((m) => m.id === unidad.moduloId)
  return { unidad, modulo }
}

function puedeVerUnidad(sesion, unidad, modulo) {
  if (!modulo) return false
  if (sesion.rol === 'ADMINISTRADOR') return true
  if (sesion.rol === 'DOCENTE') return modulo.docenteResponsableId === sesion.userId
  if (sesion.rol === 'ALUMNO') return alumnoMatriculadoEnModulo(sesion.userId, modulo.id)
  return false
}

export const tareasHandlers = [
  http.get(`${BASE}/unidades-formativas/:id/tareas`, ({ request, params }) => {
    const path = `/api/v1/unidades-formativas/${params.id}/tareas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const info = unidadConModulo(params.id)
    if (!info?.unidad) return noEncontrado(path)
    if (!puedeVerUnidad(sesion, info.unidad, info.modulo)) return sinPermiso(path)

    const lista = db.tareas.filter((t) => t.unidadFormativaId === params.id)
    return HttpResponse.json(lista)
  }),

  http.post(`${BASE}/unidades-formativas/:id/tareas`, async ({ request, params }) => {
    const path = `/api/v1/unidades-formativas/${params.id}/tareas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const info = unidadConModulo(params.id)
    if (!info?.unidad) return noEncontrado(path)
    if (sesion.rol !== 'DOCENTE' || info.modulo?.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { titulo, descripcion, fechaLimite } = cuerpo || {}
    if (!titulo || !fechaLimite) {
      return validacion('titulo y fechaLimite son obligatorios', path)
    }
    const fechaPublicacion = new Date()
    // RF-002: la fecha límite debe ser posterior a la fecha de publicación (hoy), en cliente y
    // servidor — el mock replica la validación del servidor real para que TC.9 la detecte aquí.
    if (new Date(fechaLimite) <= fechaPublicacion) {
      return reglaNegocio('La fecha límite debe ser posterior a la fecha actual', path)
    }

    const nueva = {
      id: generarId('t'),
      unidadFormativaId: params.id,
      titulo,
      descripcion: descripcion ?? '',
      fechaPublicacion: fechaPublicacion.toISOString(),
      fechaLimite,
      estado: 'PUBLICADA',
    }
    db.tareas.push(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.put(`${BASE}/tareas/:id`, async ({ request, params }) => {
    const path = `/api/v1/tareas/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const tarea = db.tareas.find((t) => t.id === params.id)
    if (!tarea) return noEncontrado(path)
    const info = unidadConModulo(tarea.unidadFormativaId)
    if (sesion.rol !== 'DOCENTE' || info?.modulo?.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    if (cuerpo.fechaLimite && new Date(cuerpo.fechaLimite) <= new Date(tarea.fechaPublicacion)) {
      return reglaNegocio('La fecha límite debe ser posterior a la fecha actual', path)
    }
    Object.assign(tarea, cuerpo)
    return HttpResponse.json(tarea)
  }),
]
