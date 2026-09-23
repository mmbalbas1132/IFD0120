import { get, put } from './httpClient.js'

export const calificarEntrega = (entregaId, datos) =>
  put(`/entregas/${entregaId}/evaluacion`, datos)
export const listarCalificacionesDeAlumno = (alumnoId) => get(`/alumnos/${alumnoId}/calificaciones`)
export const listarHistorialEvaluacion = (entregaId) =>
  get(`/entregas/${entregaId}/evaluacion/historial`)
