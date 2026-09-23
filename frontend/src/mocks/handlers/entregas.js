import { http, HttpResponse } from 'msw'
import { db, generarId } from '../db.js'
import { alumnoMatriculadoEnModulo } from '../fixtures/modulos.js'
import {
  BASE,
  csrfValido,
  noAutenticado,
  sinPermiso,
  noEncontrado,
  reglaNegocio,
  obtenerSesion,
} from './utils.js'

function tareaConModulo(tareaId) {
  const tarea = db.tareas.find((t) => t.id === tareaId)
  if (!tarea) return null
  const unidad = db.unidadesFormativas.find((uf) => uf.id === tarea.unidadFormativaId)
  const modulo = unidad ? db.modulos.find((m) => m.id === unidad.moduloId) : null
  return { tarea, unidad, modulo }
}

export const entregasHandlers = [
  // RF-003/RF-004: registrar una entrega (fichero y/o comentario), marcada automáticamente
  // fuera de plazo si fechaEntrega > fechaLimite.
  http.post(`${BASE}/tareas/:id/entregas`, async ({ request, params }) => {
    const path = `/api/v1/tareas/${params.id}/entregas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ALUMNO') return sinPermiso(path)

    const info = tareaConModulo(params.id)
    if (!info?.tarea) return noEncontrado(path)
    if (!alumnoMatriculadoEnModulo(sesion.userId, info.modulo?.id)) return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { ficheroUrl, comentario } = cuerpo || {}
    if (!ficheroUrl && !comentario) {
      return reglaNegocio('La entrega debe incluir un fichero y/o un comentario', path)
    }

    const fechaEntrega = new Date()
    const fueraDePlazo = fechaEntrega > new Date(info.tarea.fechaLimite)
    const nueva = {
      id: generarId('e'),
      tareaId: info.tarea.id,
      alumnoId: sesion.userId,
      fechaEntrega: fechaEntrega.toISOString(),
      ficheroUrl: ficheroUrl ?? null,
      comentario: comentario ?? '',
      estado: fueraDePlazo ? 'ENTREGADA_FUERA_DE_PLAZO' : 'ENTREGADA',
      evaluacion: null,
    }
    db.entregas.push(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.get(`${BASE}/tareas/:id/entregas`, ({ request, params }) => {
    const path = `/api/v1/tareas/${params.id}/entregas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const info = tareaConModulo(params.id)
    if (!info?.tarea) return noEncontrado(path)
    if (sesion.rol !== 'DOCENTE' || info.modulo?.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }

    const lista = db.entregas.filter((e) => e.tareaId === params.id)
    return HttpResponse.json(lista)
  }),

  // RF-005/RF-006: registrar/editar calificación (0–10, un decimal).
  http.put(`${BASE}/entregas/:id/evaluacion`, async ({ request, params }) => {
    const path = `/api/v1/entregas/${params.id}/evaluacion`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const entrega = db.entregas.find((e) => e.id === params.id)
    if (!entrega) return noEncontrado(path)
    const info = tareaConModulo(entrega.tareaId)
    if (sesion.rol !== 'DOCENTE' || info?.modulo?.docenteResponsableId !== sesion.userId) {
      return sinPermiso(path)
    }
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { calificacion, observaciones } = cuerpo || {}
    const numero = Number(calificacion)
    if (Number.isNaN(numero) || numero < 0 || numero > 10) {
      return reglaNegocio('La calificación debe estar entre 0 y 10', path)
    }

    entrega.evaluacion = {
      id: entrega.evaluacion?.id ?? generarId('ev'),
      calificacion: Math.round(numero * 10) / 10,
      observaciones: observaciones ?? '',
      evaluadorId: sesion.userId,
      fechaEvaluacion: new Date().toISOString(),
    }
    entrega.estado = 'CALIFICADA'
    return HttpResponse.json(entrega)
  }),
]

export const calificacionesHandlers = [
  // RF-007: un ALUMNO consulta únicamente sus propias entregas/calificaciones.
  http.get(`${BASE}/alumnos/:id/calificaciones`, ({ request, params }) => {
    const path = `/api/v1/alumnos/${params.id}/calificaciones`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol === 'ALUMNO' && sesion.userId !== params.id) return sinPermiso(path)
    if (sesion.rol !== 'ALUMNO' && sesion.rol !== 'DOCENTE' && sesion.rol !== 'ADMINISTRADOR') {
      return sinPermiso(path)
    }

    const entregasAlumno = db.entregas.filter((e) => e.alumnoId === params.id)
    const resultado = entregasAlumno.map((e) => {
      const info = tareaConModulo(e.tareaId)
      return {
        entregaId: e.id,
        tareaId: e.tareaId,
        tareaTitulo: info?.tarea?.titulo,
        moduloId: info?.modulo?.id,
        moduloNombre: info?.modulo?.nombre,
        unidadFormativaId: info?.unidad?.id,
        unidadFormativaNombre: info?.unidad?.nombre,
        estado: e.estado,
        evaluacion: e.evaluacion,
      }
    })
    return HttpResponse.json(resultado)
  }),
]
