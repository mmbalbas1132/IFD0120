// HU-06 / RF-011: visible sin login, responsive, SIN datos de alumnado ni calificaciones.
import { useEffect, useState } from 'react'
import { listarModulosPublicos } from '../../api/modulosApi.js'
import estilos from './publico.module.css'

export default function PanelPublico() {
  const [modulos, setModulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    listarModulosPublicos()
      .then((datos) => {
        if (!cancelado) setModulos(datos)
      })
      .catch((err) => {
        if (!cancelado) setError(err.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <main className={estilos.contenedor}>
      <h1>Ciclo formativo</h1>
      <p>Consulta los módulos y horas totales del ciclo. No se muestra información de alumnado.</p>
      {cargando && <p role="status">Cargando módulos…</p>}
      {error && (
        <p role="alert" aria-live="polite">
          No se pudieron cargar los módulos: {error}
        </p>
      )}
      {!cargando && !error && (
        <ul className={estilos.listaModulos}>
          {modulos.map((modulo) => (
            <li key={modulo.id} className={estilos.tarjeta}>
              <h2>{modulo.nombre}</h2>
              <p>
                Código: {modulo.codigo} · {modulo.horas} horas
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
