import { HttpResponse } from 'msw'
import { db } from '../db.js'
import { decodificarAccessTokenSimulado, tokenExpirado } from '../fakeJwt.js'
import { leerCookieDocumento, leerCookieDeCabecera } from '../../utils/cookies.js'

export const BASE = '/api/v1'

// Respuesta de error homogénea, fiel al contrato de spec.md §12.
export function errorContrato(status, error, message, path) {
  return HttpResponse.json(
    {
      timestamp: new Date().toISOString(),
      status,
      error,
      message,
      path,
    },
    { status },
  )
}

export function noAutenticado(path) {
  return errorContrato(401, 'UNAUTHORIZED', 'No autenticado o token inválido/expirado', path)
}

export function sinPermiso(path) {
  return errorContrato(403, 'FORBIDDEN', 'No tienes permiso sobre este recurso', path)
}

export function noEncontrado(path) {
  return errorContrato(404, 'NOT_FOUND', 'Recurso no encontrado', path)
}

export function validacion(message, path) {
  return errorContrato(400, 'BAD_REQUEST', message, path)
}

export function reglaNegocio(message, path) {
  return errorContrato(422, 'UNPROCESSABLE_ENTITY', message, path)
}

export function conflicto(message, path) {
  return errorContrato(409, 'CONFLICT', message, path)
}

/**
 * Decodifica y valida el access token de la cabecera Authorization.
 * Devuelve { userId, rol, jti } o null si no hay sesión válida.
 */
export function obtenerSesion(request) {
  const cabecera = request.headers.get('authorization') || ''
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null
  if (!token) return null
  const payload = decodificarAccessTokenSimulado(token)
  if (!payload) return null
  if (tokenExpirado(payload)) return null
  if (db.jtiRevocados.has(payload.jti)) return null
  const usuario = db.usuarios.find((u) => u.id === payload.sub)
  if (!usuario || !usuario.activo) return null
  return { userId: usuario.id, rol: payload.rol, jti: payload.jti, usuario }
}

/** Lee el valor esperado de csrf_token, funcionando tanto en SW real (Cookie header) como en jsdom. */
export function csrfEsperado(request) {
  if (typeof document !== 'undefined') {
    return leerCookieDocumento('csrf_token')
  }
  return leerCookieDeCabecera(request.headers.get('cookie'), 'csrf_token')
}

/** RNF-003: doble token CSRF — toda mutación exige X-CSRF-Token == cookie csrf_token. */
export function csrfValido(request) {
  const esperado = csrfEsperado(request)
  const recibido = request.headers.get('x-csrf-token')
  return Boolean(esperado) && esperado === recibido
}

export function refreshTokenId(request) {
  if (typeof document !== 'undefined') {
    return leerCookieDocumento('refresh_token')
  }
  return leerCookieDeCabecera(request.headers.get('cookie'), 'refresh_token')
}
