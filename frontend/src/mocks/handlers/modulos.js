import { http, HttpResponse } from 'msw'
import { db, generarId } from '../db.js'
import {
  BASE,
  csrfValido,
  noAutenticado,
  sinPermiso,
  noEncontrado,
  validacion,
  conflicto,
  obtenerSesion,
} from './utils.js'

export const modulosHandlers = [
  // Público — HU-06 / RF-011: sin autenticación, sin datos de alumnado.
  http.get(`${BASE}/modulos/publicos`, () => {
    return HttpResponse.json(
      db.modulos.map((m) => ({
        id: m.id,
        codigo: m.codigo,
        nombre: m.nombre,
        horas: m.horas,
      })),
    )
  }),

  http.get(`${BASE}/modulos`, ({ request }) => {
    const path = '/api/v1/modulos'
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const url = new URL(request.url)
    const docenteId = url.searchParams.get('docenteId')

    let lista = db.modulos
    if (sesion.rol === 'DOCENTE') {
      lista = lista.filter((m) => m.docenteResponsableId === sesion.userId)
    } else if (sesion.rol === 'ALUMNO') {
      // RNF-012: el alumno solo ve los módulos en los que está matriculado (ACTIVA).
      const idsModulo = db.matriculas
        .filter((m) => m.alumnoId === sesion.userId && m.estado === 'ACTIVA')
        .map((m) => m.moduloId)
      lista = lista.filter((m) => idsModulo.includes(m.id))
    } else if (docenteId) {
      lista = lista.filter((m) => m.docenteResponsableId === docenteId)
    }
    // NOTA (gap de contrato, a reconciliar en 002/003-implantacion Paso 0): spec.md §12 no
    // define un endpoint propio para listar las unidades formativas de un módulo ni las
    // matriculaciones activas de un módulo (solo POST/DELETE por id). Hasta que eso se decida,
    // el mock las devuelve embebidas en cada módulo para que el cliente pueda navegar
    // Modulo → UnidadFormativa → Tarea/Recurso y gestionar matrículas sin rutas nuevas.
    const listaEnriquecida = lista.map((m) => ({
      ...m,
      unidadesFormativas: db.unidadesFormativas
        .filter((uf) => uf.moduloId === m.id)
        .sort((a, b) => a.orden - b.orden),
      matriculas: db.matriculas
        .filter((mat) => mat.moduloId === m.id && mat.estado === 'ACTIVA')
        .map((mat) => {
          const alumno = db.usuarios.find((u) => u.id === mat.alumnoId)
          return {
            id: mat.id,
            alumnoId: mat.alumnoId,
            alumnoNombre: alumno ? `${alumno.nombre} ${alumno.apellidos}` : mat.alumnoId,
            fechaMatricula: mat.fechaMatricula,
          }
        }),
    }))
    return HttpResponse.json(listaEnriquecida)
  }),

  http.post(`${BASE}/modulos`, async ({ request }) => {
    const path = '/api/v1/modulos'
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { codigo, nombre, horas, docenteResponsableId } = cuerpo || {}
    if (!codigo || !nombre || !horas) {
      return validacion('codigo, nombre y horas son obligatorios', path)
    }
    if (db.modulos.some((m) => m.codigo === codigo)) {
      return conflicto('Ya existe un módulo con ese código', path)
    }
    const nuevo = {
      id: generarId('m'),
      codigo,
      nombre,
      horas,
      docenteResponsableId: docenteResponsableId ?? null,
    }
    db.modulos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.put(`${BASE}/modulos/:id`, async ({ request, params }) => {
    const path = `/api/v1/modulos/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const modulo = db.modulos.find((m) => m.id === params.id)
    if (!modulo) return noEncontrado(path)

    const cuerpo = await request.json()
    Object.assign(modulo, cuerpo)
    return HttpResponse.json(modulo)
  }),

  http.post(`${BASE}/modulos/:id/unidades-formativas`, async ({ request, params }) => {
    const path = `/api/v1/modulos/${params.id}/unidades-formativas`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const modulo = db.modulos.find((m) => m.id === params.id)
    if (!modulo) return noEncontrado(path)

    const cuerpo = await request.json()
    const { codigo, nombre, horas } = cuerpo || {}
    if (!codigo || !nombre || !horas) {
      return validacion('codigo, nombre y horas son obligatorios', path)
    }
    const nueva = {
      id: generarId('uf'),
      moduloId: modulo.id,
      codigo,
      nombre,
      horas,
      orden: db.unidadesFormativas.filter((uf) => uf.moduloId === modulo.id).length + 1,
    }
    db.unidadesFormativas.push(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),
]
