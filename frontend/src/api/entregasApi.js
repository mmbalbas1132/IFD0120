import { get, postFormulario } from './httpClient.js'

// RF-003: `datos` = { fichero?: File, comentario?: string }; reemplaza la entrega si ya existe y no
// está calificada (200) o la crea (201).
export const crearEntrega = (tareaId, datos) => postFormulario(`/tareas/${tareaId}/entregas`, datos)
export const listarEntregasDeTarea = (tareaId) => get(`/tareas/${tareaId}/entregas`)
