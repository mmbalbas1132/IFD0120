import { get, post } from './httpClient.js'

export const listarRecursosDeUnidad = (unidadFormativaId) =>
  get(`/unidades-formativas/${unidadFormativaId}/recursos`)
export const crearRecurso = (unidadFormativaId, datos) =>
  post(`/unidades-formativas/${unidadFormativaId}/recursos`, datos)
