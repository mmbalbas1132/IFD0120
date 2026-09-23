// Único punto de entrada HTTP del cliente (Principio 2: la UI nunca hace fetch fuera de src/api/).
// Responsable de: inyectar Authorization (access token en memoria), inyectar X-CSRF-Token en
// mutaciones, fijar credentials:'include' (cookie refresh_token) y mapear errores del contrato
// §12 a excepciones tipadas. Ver plan.md §6.
import { leerCookieDocumento } from '../utils/cookies.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const METODOS_MUTANTES = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])

export class ErrorApi extends Error {
  constructor({ status, error, message, path }) {
    super(message || `Error HTTP ${status}`)
    this.name = 'ErrorApi'
    this.status = status
    this.error = error
    this.path = path
  }
}

// El access token vive SOLO en esta variable de módulo (memoria del cliente) — nunca en
// localStorage/sessionStorage (RNF-002). AuthContext.jsx es el único que la modifica.
let accessTokenEnMemoria = null

export function fijarAccessToken(token) {
  accessTokenEnMemoria = token
}

export function obtenerAccessToken() {
  return accessTokenEnMemoria
}

async function analizarRespuestaError(respuesta) {
  let cuerpo = null
  try {
    cuerpo = await respuesta.json()
  } catch {
    // Respuesta sin cuerpo JSON (p. ej. 204 o error de red) — se usa un mensaje genérico.
  }
  return new ErrorApi({
    status: respuesta.status,
    error: cuerpo?.error ?? 'ERROR',
    message: cuerpo?.message ?? `Error HTTP ${respuesta.status}`,
    path: cuerpo?.path,
  })
}

/**
 * @param {string} ruta - ruta relativa a BASE_URL, p. ej. '/modulos/publicos'
 * @param {RequestInit} opciones
 */
export async function httpClient(ruta, opciones = {}) {
  const metodo = (opciones.method ?? 'GET').toUpperCase()
  const cabeceras = new Headers(opciones.headers ?? {})

  // Con FormData (subida de ficheros, RNF-014) el navegador fija el Content-Type multipart con su
  // boundary: fijarlo aquí a mano lo rompería.
  const esFormulario = opciones.body instanceof FormData
  if (opciones.body && !esFormulario && !cabeceras.has('Content-Type')) {
    cabeceras.set('Content-Type', 'application/json')
  }
  if (accessTokenEnMemoria) {
    cabeceras.set('Authorization', `Bearer ${accessTokenEnMemoria}`)
  }
  // Solo se auto-inyecta si la persona que llama no ha fijado ya la cabecera explícitamente
  // (permite, p. ej., que las pruebas fuercen un valor incorrecto para verificar el rechazo 403).
  if (METODOS_MUTANTES.has(metodo) && !cabeceras.has('X-CSRF-Token')) {
    const csrf = leerCookieDocumento('csrf_token')
    if (csrf) cabeceras.set('X-CSRF-Token', csrf)
  }

  const { comoBlob, ...opcionesFetch } = opciones
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opcionesFetch,
    method: metodo,
    headers: cabeceras,
    credentials: 'include', // adjunta la cookie refresh_token (HttpOnly) automáticamente
  })

  if (!respuesta.ok) {
    throw await analizarRespuestaError(respuesta)
  }
  if (respuesta.status === 204) return null
  if (comoBlob) return respuesta.blob()
  const tipoContenido = respuesta.headers.get('content-type') ?? ''
  if (tipoContenido.includes('application/json')) {
    return respuesta.json()
  }
  return null
}

export const get = (ruta, opciones) => httpClient(ruta, { ...opciones, method: 'GET' })
export const post = (ruta, cuerpo, opciones) =>
  httpClient(ruta, { ...opciones, method: 'POST', body: JSON.stringify(cuerpo ?? {}) })
export const put = (ruta, cuerpo, opciones) =>
  httpClient(ruta, { ...opciones, method: 'PUT', body: JSON.stringify(cuerpo ?? {}) })
export const del = (ruta, opciones) => httpClient(ruta, { ...opciones, method: 'DELETE' })

/** POST `multipart/form-data` (§12, RNF-014): `datos` es un objeto; se omiten los valores vacíos. */
export function postFormulario(ruta, datos, opciones) {
  const formulario = new FormData()
  for (const [clave, valor] of Object.entries(datos ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') formulario.append(clave, valor)
  }
  return httpClient(ruta, { ...opciones, method: 'POST', body: formulario })
}
