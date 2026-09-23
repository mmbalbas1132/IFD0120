import { http, HttpResponse } from 'msw'
import { db, generarId, persistirEstadoSesion } from '../db.js'
import { buscarUsuarioPorEmail, CONTRASENA_SIMULADA } from '../fixtures/usuarios.js'
import { crearAccessTokenSimulado, decodificarAccessTokenSimulado } from '../fakeJwt.js'
import { escribirCookieDocumento, borrarCookieDocumento } from '../../utils/cookies.js'
import { BASE, errorContrato, obtenerSesion, refreshTokenId } from './utils.js'

// RNF-011: fuerza bruta — 5 intentos fallidos / 15 min por IP+usuario. En el mock no hay IP real,
// así que la clave es solo el email (suficiente para demostrar el comportamiento en el cliente).
const intentosFallidos = new Map() // email -> { intentos, primerIntento }
const VENTANA_MS = 15 * 60 * 1000
const LIMITE_INTENTOS = 5

function registrarIntentoFallido(email) {
  const ahora = Date.now()
  const actual = intentosFallidos.get(email)
  if (!actual || ahora - actual.primerIntento > VENTANA_MS) {
    intentosFallidos.set(email, { intentos: 1, primerIntento: ahora })
    return 1
  }
  actual.intentos += 1
  return actual.intentos
}

function limpiarIntentos(email) {
  intentosFallidos.delete(email)
}

function bloqueadoPorFuerzaBruta(email) {
  const actual = intentosFallidos.get(email)
  if (!actual) return false
  const ahora = Date.now()
  if (ahora - actual.primerIntento > VENTANA_MS) {
    intentosFallidos.delete(email)
    return false
  }
  return actual.intentos >= LIMITE_INTENTOS
}

function emitirCookiesSesion(userId, rol) {
  const refreshId = generarId('refresh')
  db.refreshSesiones.set(refreshId, { userId, rol, revocada: false })
  persistirEstadoSesion()
  const csrf = generarId('csrf')
  escribirCookieDocumento('refresh_token', refreshId)
  escribirCookieDocumento('csrf_token', csrf)
  return { refreshId, csrf }
}

function respuestaConCookies(body, { refreshId, csrf }, status = 200) {
  // En jsdom (tests), las cookies ya se fijaron de forma determinista en emitirCookiesSesion()
  // vía document.cookie. Añadir además cabeceras Set-Cookie aquí interfiere con esa escritura
  // (el pipeline fetch/undici de Node reprocesa Set-Cookie y descarta la segunda cookie) — así
  // que las cabeceras Set-Cookie solo se añaden en el Service Worker real del navegador (donde
  // `document` no existe y son la ÚNICA vía para que el navegador aplique la cookie).
  if (typeof document !== 'undefined') {
    return HttpResponse.json(body, { status })
  }
  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    `refresh_token=${refreshId}; Path=/; HttpOnly; Secure; SameSite=Strict`,
  )
  headers.append('Set-Cookie', `csrf_token=${csrf}; Path=/; Secure; SameSite=Strict`)
  return HttpResponse.json(body, { status, headers })
}

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const path = '/api/v1/auth/login'
    let cuerpo
    try {
      cuerpo = await request.json()
    } catch {
      return errorContrato(400, 'BAD_REQUEST', 'Cuerpo de la petición inválido', path)
    }
    const { email, password } = cuerpo || {}

    if (!email || !password) {
      return errorContrato(400, 'BAD_REQUEST', 'email y password son obligatorios', path)
    }

    if (bloqueadoPorFuerzaBruta(email)) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 429,
          error: 'TOO_MANY_REQUESTS',
          message: 'Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.',
          path,
        },
        { status: 429, headers: { 'Retry-After': '900' } },
      )
    }

    const usuario = buscarUsuarioPorEmail(email)
    if (!usuario || !usuario.activo || password !== CONTRASENA_SIMULADA) {
      registrarIntentoFallido(email)
      return errorContrato(401, 'UNAUTHORIZED', 'Credenciales inválidas', path)
    }

    limpiarIntentos(email)
    const accessToken = crearAccessTokenSimulado({ userId: usuario.id, rol: usuario.rol })
    const cookies = emitirCookiesSesion(usuario.id, usuario.rol)
    return respuestaConCookies(
      {
        accessToken,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      cookies,
    )
  }),

  http.post(`${BASE}/auth/refresh`, ({ request }) => {
    const path = '/api/v1/auth/refresh'
    const refreshId = refreshTokenId(request)
    const sesion = refreshId ? db.refreshSesiones.get(refreshId) : null
    if (!sesion || sesion.revocada) {
      return errorContrato(401, 'UNAUTHORIZED', 'Sesión no válida, inicia sesión de nuevo', path)
    }
    const usuario = db.usuarios.find((u) => u.id === sesion.userId)
    if (!usuario || !usuario.activo) {
      return errorContrato(401, 'UNAUTHORIZED', 'Sesión no válida, inicia sesión de nuevo', path)
    }
    const accessToken = crearAccessTokenSimulado({ userId: usuario.id, rol: usuario.rol })
    return HttpResponse.json({
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        rol: usuario.rol,
      },
    })
  }),

  http.post(`${BASE}/auth/logout`, ({ request }) => {
    const cabecera = request.headers.get('authorization') || ''
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null
    const payload = token ? decodificarAccessTokenSimulado(token) : null
    if (payload?.jti) {
      db.jtiRevocados.add(payload.jti)
    }
    const refreshId = refreshTokenId(request)
    if (refreshId && db.refreshSesiones.has(refreshId)) {
      db.refreshSesiones.get(refreshId).revocada = true
    }
    persistirEstadoSesion()
    borrarCookieDocumento('refresh_token')
    borrarCookieDocumento('csrf_token')
    if (typeof document !== 'undefined') {
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, {
      status: 204,
      headers: [
        ['Set-Cookie', 'refresh_token=; Path=/; Max-Age=0'],
        ['Set-Cookie', 'csrf_token=; Path=/; Max-Age=0'],
      ],
    })
  }),
]

export { obtenerSesion }
