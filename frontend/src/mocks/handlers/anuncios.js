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
  obtenerSesion,
} from './utils.js'

function puedeVerModulo(sesion, modulo) {
  if (!modulo) return false
  if (sesion.rol === 'ADMINISTRADOR') return true
  if (sesion.rol === 'DOCENTE') return modulo.docenteResponsableId === sesion.userId
  if (sesion.rol === 'ALUMNO') return alumnoMatriculadoEnModulo(sesion.userId, modulo.id)
  return false
}

function ordenarAnuncios(lista) {
  return [...lista].sort((a, b) => {
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1
    return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
  })
}

export const anunciosHandlers = [
  http.get(`${BASE}/modulos/:id/anuncios`, ({ request, params }) => {
    const path = `/api/v1/modulos/${params.id}/anuncios`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const modulo = db.modulos.find((m) => m.id === params.id)
    if (!modulo) return noEncontrado(path)
    if (!puedeVerModulo(sesion, modulo)) return sinPermiso(path)

    const lista = db.anuncios.filter((a) => a.moduloId === params.id)
    return HttpResponse.json(ordenarAnuncios(lista))
  }),

  http.post(`${BASE}/modulos/:id/anuncios`, async ({ request, params }) => {
    const path = `/api/v1/modulos/${params.id}/anuncios`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const modulo = db.modulos.find((m) => m.id === params.id)
    if (!modulo) return noEncontrado(path)
    if (sesion.rol !== 'DOCENTE' || modulo.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { titulo, contenido, destacado } = cuerpo || {}
    if (!titulo || !contenido) {
      return validacion('titulo y contenido son obligatorios', path)
    }

    const nuevo = {
      id: generarId('an'),
      moduloId: params.id,
      autorId: sesion.userId,
      titulo,
      contenido,
      fechaPublicacion: new Date().toISOString(),
      destacado: Boolean(destacado),
    }
    db.anuncios.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),
]
