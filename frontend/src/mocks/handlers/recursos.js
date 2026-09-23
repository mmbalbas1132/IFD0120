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
  leerCuerpo,
  obtenerSesion,
} from './utils.js'
import { errorDeFichero, guardarAdjunto } from './adjuntos.js'

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

    // RF-012 / §12: un DOCUMENTO lleva `fichero`; VIDEO y ENLACE, `url`.
    const { campos, fichero } = await leerCuerpo(request)
    const { titulo, tipo, url, descripcion } = campos
    if (!titulo || !tipo) {
      return validacion('titulo y tipo son obligatorios', path)
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return validacion(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`, path)
    }
    if (tipo === 'DOCUMENTO' && !fichero) {
      return validacion('Un recurso de tipo DOCUMENTO necesita un fichero', path)
    }
    if (tipo !== 'DOCUMENTO' && !url) {
      return validacion('Un recurso de tipo VIDEO o ENLACE necesita una URL', path)
    }
    if (fichero) {
      const error = errorDeFichero(fichero, path)
      if (error) return error
    }

    const nuevo = {
      id: generarId('r'),
      unidadFormativaId: params.id,
      titulo,
      tipo,
      url: tipo === 'DOCUMENTO' ? null : url,
      adjunto: tipo === 'DOCUMENTO' ? await guardarAdjunto(fichero, sesion.userId) : null,
      descripcion: descripcion ?? '',
      fechaPublicacion: new Date().toISOString(),
    }
    db.recursos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),
]
