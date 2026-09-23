import { get, post, put } from './httpClient.js'

export const listarTareasDeUnidad = (unidadFormativaId) =>
  get(`/unidades-formativas/${unidadFormativaId}/tareas`)
export const crearTarea = (unidadFormativaId, datos) =>
  post(`/unidades-formativas/${unidadFormativaId}/tareas`, datos)
export const editarTarea = (tareaId, datos) => put(`/tareas/${tareaId}`, datos)
