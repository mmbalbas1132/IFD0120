import { get, post, put } from './httpClient.js'

export const listarModulosPublicos = () => get('/modulos/publicos')
export const listarModulos = (docenteId) =>
  get(docenteId ? `/modulos?docenteId=${encodeURIComponent(docenteId)}` : '/modulos')
export const crearModulo = (datos) => post('/modulos', datos)
export const editarModulo = (id, datos) => put(`/modulos/${id}`, datos)
export const crearUnidadFormativa = (moduloId, datos) =>
  post(`/modulos/${moduloId}/unidades-formativas`, datos)
