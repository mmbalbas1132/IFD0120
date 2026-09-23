import { get, postFormulario } from './httpClient.js'

export const listarRecursosDeUnidad = (unidadFormativaId) =>
  get(`/unidades-formativas/${unidadFormativaId}/recursos`)
export const crearRecurso = (unidadFormativaId, datos) =>
  postFormulario(`/unidades-formativas/${unidadFormativaId}/recursos`, datos)
