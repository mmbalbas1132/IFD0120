import { post, del } from './httpClient.js'

export const crearMatricula = (datos) => post('/matriculas', datos)
export const darDeBajaMatricula = (id) => del(`/matriculas/${id}`)
