import { get, post } from './httpClient.js'

export const crearEntrega = (tareaId, datos) => post(`/tareas/${tareaId}/entregas`, datos)
export const listarEntregasDeTarea = (tareaId) => get(`/tareas/${tareaId}/entregas`)
