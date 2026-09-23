// Estado mutable en memoria del mock. Los handlers leen/escriben aquí en vez de sobre los
// fixtures directamente, para que crear una tarea/entrega/etc. durante una sesión de `npm run dev`
// se refleje en las siguientes peticiones.
//
// Nota sobre recargar la página (F5) en `npm run dev`: un reload real del navegador reinicia todo
// el estado JS (igual que perdería el access token en memoria en el diseño real — plan.md §6),
// incluido este objeto `db`. La cookie refresh_token (real, vía document.cookie) SÍ sobrevive al
// reload, pero sin persistir también `refreshSesiones` aquí, el mock no podría reconocerla y
// devolvería 401 en /auth/refresh — dando la falsa impresión de que la sesión no se recupera
// (cuando en el diseño real sí lo haría, porque el servidor real no pierde su base de datos al
// recargar el cliente). Por eso `refreshSesiones`/`jtiRevocados` se replican en `sessionStorage`
// (vida ligada a la pestaña, igual que una cookie de sesión) — solo fuera de Vitest, para no
// romper el aislamiento entre pruebas (ver tests/setup.js).
import { usuarios } from './fixtures/usuarios.js'
import { modulos, unidadesFormativas, matriculas } from './fixtures/modulos.js'
import { tareas } from './fixtures/tareas.js'
import { entregas } from './fixtures/entregas.js'
import { recursos } from './fixtures/recursos.js'
import { anuncios } from './fixtures/anuncios.js'

const CLAVE_STORAGE = 'gestorfp-mock-sesiones'
const PERSISTENCIA_ACTIVA =
  typeof sessionStorage !== 'undefined' && import.meta.env?.MODE !== 'test'

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor))
}

function estadoSesionInicial() {
  if (!PERSISTENCIA_ACTIVA) return { jtiRevocados: new Set(), refreshSesiones: new Map() }
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE_STORAGE) ?? 'null')
    if (!guardado) return { jtiRevocados: new Set(), refreshSesiones: new Map() }
    return {
      jtiRevocados: new Set(guardado.jtiRevocados ?? []),
      refreshSesiones: new Map(guardado.refreshSesiones ?? []),
    }
  } catch {
    return { jtiRevocados: new Set(), refreshSesiones: new Map() }
  }
}

export function persistirEstadoSesion() {
  if (!PERSISTENCIA_ACTIVA) return
  sessionStorage.setItem(
    CLAVE_STORAGE,
    JSON.stringify({
      jtiRevocados: [...db.jtiRevocados],
      refreshSesiones: [...db.refreshSesiones.entries()],
    }),
  )
}

export const db = {
  usuarios: clonar(usuarios),
  modulos: clonar(modulos),
  unidadesFormativas: clonar(unidadesFormativas),
  matriculas: clonar(matriculas),
  tareas: clonar(tareas),
  entregas: clonar(entregas),
  recursos: clonar(recursos),
  anuncios: clonar(anuncios),
  // jti revocados (simula tokens_revocados de RNF-002/plan.md §6).
  ...estadoSesionInicial(),
}

let contadorId = 1000
export function generarId(prefijo) {
  contadorId += 1
  return `${prefijo}-${contadorId}`
}

export function resetearDb() {
  db.usuarios = clonar(usuarios)
  db.modulos = clonar(modulos)
  db.unidadesFormativas = clonar(unidadesFormativas)
  db.matriculas = clonar(matriculas)
  db.tareas = clonar(tareas)
  db.entregas = clonar(entregas)
  db.recursos = clonar(recursos)
  db.anuncios = clonar(anuncios)
  db.jtiRevocados = new Set()
  db.refreshSesiones = new Map()
}
