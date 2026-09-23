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
import { validarPasswordNueva } from '../../utils/password.js'

function serializarUsuario(u) {
  const { id, nombre, apellidos, email, rol, activo, fechaAlta, debeCambiarPassword } = u
  return { id, nombre, apellidos, email, rol, activo, fechaAlta, debeCambiarPassword }
}

// RF-017: contraseña temporal aleatoria que cumple RF-018 (una de cada clase + relleno aleatorio).
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const MINUSCULAS = 'abcdefghijkmnpqrstuvwxyz'
const NUMEROS = '23456789'
const SIMBOLOS = '!@#$%&*?'

function caracterAleatorio(alfabeto) {
  const [valor] = crypto.getRandomValues(new Uint32Array(1))
  return alfabeto[valor % alfabeto.length]
}

function generarPasswordTemporal() {
  const todos = MAYUSCULAS + MINUSCULAS + NUMEROS + SIMBOLOS
  const caracteres = [
    caracterAleatorio(MAYUSCULAS),
    caracterAleatorio(NUMEROS),
    caracterAleatorio(SIMBOLOS),
    ...Array.from({ length: 9 }, () => caracterAleatorio(todos)),
  ]
  for (let i = caracteres.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]]
  }
  return caracteres.join('')
}

export const usuariosHandlers = [
  http.get(`${BASE}/usuarios`, ({ request }) => {
    const path = '/api/v1/usuarios'
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)

    const url = new URL(request.url)
    const pagina = Number(url.searchParams.get('pagina') ?? 0)
    const tamano = Number(url.searchParams.get('tamano') ?? 20)
    const inicio = pagina * tamano
    const contenido = db.usuarios.slice(inicio, inicio + tamano).map(serializarUsuario)
    return HttpResponse.json({
      contenido,
      totalElementos: db.usuarios.length,
      pagina,
      tamano,
    })
  }),

  http.post(`${BASE}/usuarios`, async ({ request }) => {
    const path = '/api/v1/usuarios'
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const cuerpo = await request.json()
    const { nombre, apellidos, email, rol } = cuerpo || {}
    if (!nombre || !apellidos || !email || !rol) {
      return validacion('nombre, apellidos, email y rol son obligatorios', path)
    }
    if (db.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return conflicto('Ya existe un usuario con ese email', path)
    }
    const nuevo = {
      id: generarId('u'),
      nombre,
      apellidos,
      email,
      rol,
      activo: true,
      debeCambiarPassword: false,
      fechaAlta: new Date().toISOString().slice(0, 10),
    }
    db.usuarios.push(nuevo)
    return HttpResponse.json(serializarUsuario(nuevo), { status: 201 })
  }),

  http.get(`${BASE}/usuarios/:id`, ({ request, params }) => {
    const path = `/api/v1/usuarios/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR' && sesion.userId !== params.id) return sinPermiso(path)

    const usuario = db.usuarios.find((u) => u.id === params.id)
    if (!usuario) return noEncontrado(path)
    return HttpResponse.json(serializarUsuario(usuario))
  }),

  http.put(`${BASE}/usuarios/:id`, async ({ request, params }) => {
    const path = `/api/v1/usuarios/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR' && sesion.userId !== params.id) return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const usuario = db.usuarios.find((u) => u.id === params.id)
    if (!usuario) return noEncontrado(path)

    const cuerpo = await request.json()
    // Un usuario no-admin no puede cambiarse el rol a sí mismo.
    if (sesion.rol !== 'ADMINISTRADOR') delete cuerpo.rol
    Object.assign(usuario, cuerpo)
    return HttpResponse.json(serializarUsuario(usuario))
  }),

  // RF-017: el servidor genera la temporal y la devuelve una sola vez.
  http.post(`${BASE}/usuarios/:id/restablecer-password`, ({ request, params }) => {
    const path = `/api/v1/usuarios/${params.id}/restablecer-password`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const usuario = db.usuarios.find((u) => u.id === params.id)
    if (!usuario) return noEncontrado(path)
    const passwordTemporal = generarPasswordTemporal()
    db.credenciales.set(usuario.id, passwordTemporal)
    usuario.debeCambiarPassword = true
    return HttpResponse.json({ passwordTemporal })
  }),

  // RF-018: cambio de la propia contraseña; desactiva la obligación de RF-017.
  http.put(`${BASE}/usuarios/:id/password`, async ({ request, params }) => {
    const path = `/api/v1/usuarios/${params.id}/password`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.userId !== params.id) return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const { passwordActual, passwordNueva } = (await request.json().catch(() => null)) ?? {}
    if (passwordActual !== db.credenciales.get(sesion.userId)) {
      return validacion('La contraseña actual no es correcta', path)
    }
    const error = validarPasswordNueva(passwordNueva, passwordActual)
    if (error) return validacion(error, path)

    db.credenciales.set(sesion.userId, passwordNueva)
    sesion.usuario.debeCambiarPassword = false
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(`${BASE}/usuarios/:id`, ({ request, params }) => {
    const path = `/api/v1/usuarios/${params.id}`
    const sesion = obtenerSesion(request)
    if (!sesion) return noAutenticado(path)
    if (sesion.rol !== 'ADMINISTRADOR') return sinPermiso(path)
    if (!csrfValido(request)) return sinPermiso(path)

    const usuario = db.usuarios.find((u) => u.id === params.id)
    if (!usuario) return noEncontrado(path)
    usuario.activo = false // baja lógica, RF-008
    return new HttpResponse(null, { status: 204 })
  }),
]
