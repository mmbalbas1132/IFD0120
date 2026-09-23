// Un handler por recurso, fiel a la tabla de spec.md §12 (TC.4): cada fila del contrato tiene
// su handler equivalente aquí.
import { authHandlers } from './auth.js'
import { modulosHandlers } from './modulos.js'
import { usuariosHandlers } from './usuarios.js'
import { matriculasHandlers } from './matriculas.js'
import { tareasHandlers } from './tareas.js'
import { entregasHandlers, calificacionesHandlers } from './entregas.js'
import { recursosHandlers } from './recursos.js'
import { anunciosHandlers } from './anuncios.js'

export const handlers = [
  ...authHandlers,
  ...modulosHandlers,
  ...usuariosHandlers,
  ...matriculasHandlers,
  ...tareasHandlers,
  ...entregasHandlers,
  ...calificacionesHandlers,
  ...recursosHandlers,
  ...anunciosHandlers,
]
