import { describe, it, expect } from 'vitest'
import { BASE } from './utils.js'

// TC.4 — smoke test: cada fila del contrato de spec.md §12 tiene un handler equivalente.
// No comprueba lógica de negocio (eso lo hacen los tests de cada componente/httpClient), solo que
// la petición es INTERCEPTADA por MSW (con onUnhandledRequest:'error' en tests/setup.js, una ruta
// sin handler haría fallar el test con un error de "unhandled request").
const filasDelContrato = [
  ['post', '/auth/login'],
  ['post', '/auth/refresh'],
  ['post', '/auth/logout'], // TS.8/RNF-002 — revocación de sesión, no listado explícitamente en §12
  ['get', '/modulos/publicos'],
  ['get', '/usuarios'],
  ['post', '/usuarios'],
  ['get', '/usuarios/u-alumno-1'],
  ['put', '/usuarios/u-alumno-1'],
  ['delete', '/usuarios/u-alumno-1'],
  ['post', '/usuarios/u-alumno-1/restablecer-password'],
  ['put', '/usuarios/u-alumno-1/password'],
  ['get', '/modulos'],
  ['post', '/modulos'],
  ['put', '/modulos/m-1'],
  ['post', '/modulos/m-1/unidades-formativas'],
  ['post', '/matriculas'],
  ['delete', '/matriculas/mat-1'],
  ['get', '/unidades-formativas/uf-1/tareas'],
  ['post', '/unidades-formativas/uf-1/tareas'],
  ['put', '/tareas/t-1'],
  ['post', '/tareas/t-1/entregas'],
  ['get', '/tareas/t-1/entregas'],
  ['put', '/entregas/e-1/evaluacion'],
  ['get', '/entregas/e-1/evaluacion/historial'],
  ['get', '/alumnos/u-alumno-1/calificaciones'],
  ['get', '/unidades-formativas/uf-1/recursos'],
  ['post', '/unidades-formativas/uf-1/recursos'],
  ['get', '/modulos/m-1/anuncios'],
  ['post', '/modulos/m-1/anuncios'],
  ['get', '/adjuntos/adj-1'],
]

describe('contrato §12 — cobertura de handlers MSW', () => {
  it.each(filasDelContrato)('%s %s tiene un handler MSW', async (metodo, ruta) => {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: ['post', 'put'].includes(metodo) ? '{}' : undefined,
    })
    // Cualquier respuesta HTTP real (incluidos 400/401/403/404) confirma que hay handler:
    // si no lo hubiera, `fetch` habría lanzado por onUnhandledRequest:'error'.
    expect(respuesta).toBeInstanceOf(Response)
  })
})
