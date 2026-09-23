// HU-04 / RF-007: solo las entregas/calificaciones propias, agrupadas por módulo y unidad.
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listarCalificacionesDeAlumno } from '../../api/evaluacionesApi.js'
import estilos from './alumno.module.css'

function agruparPorModulo(calificaciones) {
  const grupos = new Map()
  for (const c of calificaciones) {
    const clave = c.moduloNombre ?? 'Sin módulo'
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(c)
  }
  return grupos
}

export default function MisCalificaciones() {
  const { usuario } = useAuth()
  const [calificaciones, setCalificaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!usuario) return
    listarCalificacionesDeAlumno(usuario.id)
      .then(setCalificaciones)
      .finally(() => setCargando(false))
  }, [usuario])

  if (cargando) return <p role="status">Cargando calificaciones…</p>

  const grupos = agruparPorModulo(calificaciones)

  return (
    <main className={estilos.contenedor}>
      <h1>Mis calificaciones</h1>
      {[...grupos.entries()].map(([modulo, filas]) => (
        <table key={modulo} className={estilos.tablaCalificaciones}>
          <caption>{modulo}</caption>
          <thead>
            <tr>
              <th scope="col">Unidad formativa</th>
              <th scope="col">Tarea</th>
              <th scope="col">Estado</th>
              <th scope="col">Calificación</th>
              <th scope="col">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.entregaId}>
                <td>{fila.unidadFormativaNombre}</td>
                <td>{fila.tareaTitulo}</td>
                <td>{fila.estado}</td>
                <td>{fila.evaluacion?.calificacion ?? '—'}</td>
                <td>{fila.evaluacion?.observaciones ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
      {grupos.size === 0 && <p>Todavía no tienes entregas registradas.</p>}
    </main>
  )
}
