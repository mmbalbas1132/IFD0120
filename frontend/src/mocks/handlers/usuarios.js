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

function serializarUsuario(u) {
  const { id, nombre, apellidos, email, rol, activo, fechaAlta } = u
  return { id, nombre, apellidos, email, rol, activo, fechaAlta }
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
