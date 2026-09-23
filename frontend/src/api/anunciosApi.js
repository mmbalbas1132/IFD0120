import { get, post } from './httpClient.js'

export const listarAnunciosDeModulo = (moduloId) => get(`/modulos/${moduloId}/anuncios`)
export const crearAnuncio = (moduloId, datos) => post(`/modulos/${moduloId}/anuncios`, datos)
