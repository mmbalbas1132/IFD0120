// RNF-014 / §12: almacenamiento y descarga de adjuntos. El mock valida tamaño y tipo declarado; la
// comprobación del tipo por contenido real es responsabilidad del servidor de 002 (plan.md §6.1).
import { http, HttpResponse } from 'msw'
import { db, generarId } from '../db.js'
import { alumnoMatriculadoEnModulo } from '../fixtures/modulos.js'
import {
  MENSAJE_TAMANO,
  MENSAJE_TIPO,
  TAMANO_MAXIMO_BYTES,
  validarFichero,
} from '../../utils/adjuntos.js'
import {
  BASE,
  ficheroDemasiadoGrande,
  noAutenticado,
  noEncontrado,
  obtenerSesion,
  sinPermiso,
  tipoNoPermitido,
} from './utils.js'

export function serializarAdjunto({ id, nombre, tipo, datos }) {
  return { id, nombre, tipo, tamano: datos.byteLength }
}

/** Devuelve una respuesta de error `413`/`415` si el fichero incumple RNF-014, o `null`. */
export function errorDeFichero(fichero, path) {
  if (fichero.size > TAMANO_MAXIMO_BYTES) return ficheroDemasiadoGrande(MENSAJE_TAMANO, path)
  if (validarFichero(fichero)) return tipoNoPermitido(MENSAJE_TIPO, path)
  return null
}

/** Guarda un fichero ya validado y devuelve su representación pública de §12. */
export async function guardarAdjunto(fichero, subidoPorId) {
  const adjunto = {
    id: generarId('adj'),
    nombre: fichero.name,
    tipo: fichero.type || 'application/octet-stream',
    subidoPorId,
    datos: new Uint8Array(await fichero.arrayBuffer()),
  }
  db.adjuntos.set(adjunto.id, adjunto)
  return serializarAdjunto(adjunto)
}

export function eliminarAdjunto(adjunto) {
  if (adjunto) db.adjuntos.delete(adjunto.id)
}

function moduloDeUnidad(unidadFormativaId) {
  const unidad = db.unidadesFormativas.find((uf) => uf.id === unidadFormativaId)
  return unidad ? db.modulos.find((m) => m.id === unidad.moduloId) : null
}

function veModulo(sesion, modulo) {
  if (!modulo) return false
  if (sesion.rol === 'ADMINISTRADOR') return true
  if (sesion.rol === 'DOCENTE') return modulo.docenteResponsableId === sesion.userId
  return sesion.rol === 'ALUMNO' && alumnoMatriculadoEnModulo(sesion.userId, modulo.id)
}

// El adjunto hereda los permisos del elemento al que pertenece (RNF-014, RNF-012).
function puedeDescargar(sesion, adjuntoId) {
  const tarea = db.tareas.find((t) => t.adjunto?.id === adjuntoId)
  if (tarea) return veModulo(sesion, moduloDeUnidad(tarea.unidadFormativaId))

  const recurso = db.recursos.find((r) => r.adjunto?.id === adjuntoId)
  if (recurso) return veModulo(sesion, moduloDeUnidad(recurso.unidadFormativaId))

  const entrega = db.entregas.find((e) => e.adjunto?.id === adjuntoId)
  if (entrega) {
    if (sesion.rol === 'ALUMNO') return entrega.alumnoId === sesion.userId
    const tareaEntrega = db.tareas.find((t) => t.id === entrega.tareaId)
    const modulo = tareaEntrega ? moduloDeUnidad(tareaEntrega.unidadFormativaId) : null
    return sesion.rol === 'DOCENTE' && veModulo(sesion, modulo)
  }
  return false
}

export const adjuntosHandlers = [
  http.get(`${BASE}/adjuntos/:id`, ({ request, params }) => {
    const path = `/api/v1/adjuntos/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)

    const adjunto = db.adjuntos.get(params.id)
    if (!adjunto) return noEncontrado(path)
    if (!puedeDescargar(sesion, adjunto.id)) return sinPermiso(path)

    return new HttpResponse(adjunto.datos, {
      headers: {
        'Content-Type': adjunto.tipo,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(adjunto.nombre)}"`,
      },
    })
  }),
]
