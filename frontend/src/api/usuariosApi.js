import { get, post, put, del } from './httpClient.js'

export const listarUsuarios = (pagina = 0, tamano = 20) =>
  get(`/usuarios?pagina=${pagina}&tamano=${tamano}`)
export const crearUsuario = (datos) => post('/usuarios', datos)
export const obtenerUsuario = (id) => get(`/usuarios/${id}`)
export const editarUsuario = (id, datos) => put(`/usuarios/${id}`, datos)
export const darDeBajaUsuario = (id) => del(`/usuarios/${id}`)
