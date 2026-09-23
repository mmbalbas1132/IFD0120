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

const TIPOS_VALIDOS = ['DOCUMENTO', 'VIDEO', 'ENLACE']

function unidadConModulo(unidadFormativaId) {
  const unidad = db.unidadesFormativas.find((uf) => uf.id === unidadFormativaId)
  if (!unidad) return null
  const modulo = db.modulos.find((m) => m.id === unidad.moduloId)
  return { unidad, modulo }
}

function puedeVerUnidad(sesion, modulo) {
  if (!modulo) return false
  if (sesion.rol === 'ADMINISTRADOR') return true
  if (sesion.rol === 'DOCENTE') return modulo.docenteResponsableId === sesion.userId
  if (sesion.rol === 'ALUMNO') return alumnoMatriculadoEnModulo(sesion.userId, modulo.id)
  return false
}

export const recursosHandlers = [
  http.get(`${BASE}/unidades-formativas/:id/recursos`, ({ request, params }) => {
    const path = `/api/v1/unidades-formativas/${params.id}/recursos`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const info = unidadConModulo(params.id)
    if (!info?.unidad) return noEncontrado(path)
    if (!puedeVerUnidad(sesion, info.modulo)) return sinPermiso(path)

    return HttpResponse.json(db.recursos.filter((r) => r.unidadFormativaId === params.id))
  }),

  http.post(`${BASE}/unidades-formativas/:id/recursos`, async ({ request, params }) => {
    const path = `/api/v1/unidades-formativas/${params.id}/recursos`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const info = unidadConModulo(params.id)
    if (!info?.unidad) return noEncontrado(path)
    if (sesion.rol !== 'DOCENTE' || info.modulo?.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { titulo, tipo, url, descripcion } = cuerpo || {}
    if (!titulo || !tipo || !url) {
      return validacion('titulo, tipo y url son obligatorios', path)
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return validacion(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, path)
    }

    const nuevo = {
      id: generarId('r'),
      unidadFormativaId: params.id,
      titulo,
      tipo,
      url,
      descripcion: descripcion ?? '',
      fechaPublicacion: new Date().toISOString(),
    }
    db.recursos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),
]
