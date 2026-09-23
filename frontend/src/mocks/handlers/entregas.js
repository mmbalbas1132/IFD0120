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
  conflicto,
  leerCuerpo,
  obtenerSesion,
} from './utils.js'
import { eliminarAdjunto, errorDeFichero, guardarAdjunto } from './adjuntos.js'

function tareaConModulo(tareaId) {
  const tarea = db.tareas.find((t) => t.id === tareaId)
  if (!tarea) return null
  const unidad = db.unidadesFormativas.find((uf) => uf.id === tarea.unidadFormativaId)
  const modulo = unidad ? db.modulos.find((m) => m.id === unidad.moduloId) : null
  return { tarea, unidad, modulo }
}

export const entregasHandlers = [
  // RF-003/RF-004: registrar una entrega (fichero y/o comentario), marcada automáticamente
  // fuera de plazo si fechaEntrega > fechaLimite. Una entrega por alumno y tarea: mientras no esté
  // calificada, una nueva la reemplaza (200); ya calificada, 409.
  http.post(`${BASE}/tareas/:id/entregas`, async ({ request, params }) => {
    const path = `/api/v1/tareas/${params.id}/entregas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ALUMNO') return sinPermiso(path)

    const info = tareaConModulo(params.id)
    if (!info?.tarea) return noEncontrado(path)
    if (!alumnoMatriculadoEnModulo(sesion.userId, info.modulo?.id)) return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const { campos, fichero } = await leerCuerpo(request)
    const comentario = campos.comentario?.trim() ?? ''
    if (!fichero && !comentario) {
      return reglaNegocio('La entrega debe incluir un fichero y/o un comentario', path)
    }
    if (fichero) {
      const error = errorDeFichero(fichero, path)
      if (error) return error
    }

    const existente = db.entregas.find(
      (e) => e.tareaId === info.tarea.id && e.alumnoId === sesion.userId,
    )
    if (existente?.estado === 'CALIFICADA') {
      return conflicto('La entrega ya está calificada y no se puede reemplazar', path)
    }

    const fechaEntrega = new Date()
    const fueraDePlazo = fechaEntrega > new Date(info.tarea.fechaLimite)
    const datos = {
      fechaEntrega: fechaEntrega.toISOString(),
      adjunto: fichero ? await guardarAdjunto(fichero, sesion.userId) : null,
      comentario,
      estado: fueraDePlazo ? 'ENTREGADA_FUERA_DE_PLAZO' : 'ENTREGADA',
    }
    if (existente) {
      eliminarAdjunto(existente.adjunto) // el reemplazo sustituye también el fichero (§12)
      Object.assign(existente, datos)
      return HttpResponse.json(existente, { status: 200 })
    }
    const nueva = {
      id: generarId('e'),
      tareaId: info.tarea.id,
      alumnoId: sesion.userId,
      ...datos,
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

    const anterior = entrega.evaluacion
    entrega.evaluacion = {
      id: anterior?.id ?? generarId('ev'),
      calificacion: Math.round(numero * 10) / 10,
      observaciones: observaciones ?? '',
      evaluadorId: sesion.userId,
      fechaEvaluacion: new Date().toISOString(),
    }
    // RF-016: cada registro o cambio queda en un historial de solo inserción.
    db.historialEvaluaciones.push({
      id: generarId('hev'),
      evaluacionId: entrega.evaluacion.id,
      autorCambioId: sesion.userId,
      fechaCambio: entrega.evaluacion.fechaEvaluacion,
      calificacionAnterior: anterior?.calificacion ?? null,
      calificacionNueva: entrega.evaluacion.calificacion,
      observacionesAnteriores: anterior?.observaciones ?? null,
      observacionesNuevas: entrega.evaluacion.observaciones,
    })
    entrega.estado = 'CALIFICADA'
    return HttpResponse.json(entrega)
  }),

  // RF-016: historial de cambios de la calificación, del más reciente al más antiguo.
  http.get(`${BASE}/entregas/:id/evaluacion/historial`, ({ request, params }) => {
    const path = `/api/v1/entregas/${params.id}/evaluacion/historial`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const entrega = db.entregas.find((e) => e.id === params.id)
    if (!entrega) return noEncontrado(path)
    const info = tareaConModulo(entrega.tareaId)
    const esDocenteDelModulo =
      sesion.rol === 'DOCENTE' && info?.modulo?.docenteResponsableId === sesion.userId
    if (!esDocenteDelModulo && sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)

    const historial = db.historialEvaluaciones
      .filter((h) => h.evaluacionId === entrega.evaluacion?.id)
      .map((h) => {
        const autor = db.usuarios.find((u) => u.id === h.autorCambioId)
        return { ...h, autorCambioNombre: autor ? `${autor.nombre} ${autor.apellidos}` : null }
      })
      .reverse()
    return HttpResponse.json(historial)
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
        fechaEntrega: e.fechaEntrega,
        comentario: e.comentario,
        adjunto: e.adjunto,
        estado: e.estado,
        evaluacion: e.evaluacion,
      }
    })
    return HttpResponse.json(resultado)
  }),
]
