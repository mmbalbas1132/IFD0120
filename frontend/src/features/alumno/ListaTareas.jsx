// Precondición de HU-02: el alumno ve sus tareas antes de poder entregar una.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useModulosConUnidades } from '../../hooks/useModulosConUnidades.js'
import { listarTareasDeUnidad } from '../../api/tareasApi.js'
import estilos from './alumno.module.css'

export default function ListaTareas() {
  const { modulos, cargando: cargandoModulos } = useModulosConUnidades()
  const [unidadId, setUnidadId] = useState('')
  const [tareas, setTareas] = useState([])
  const [cargandoTareas, setCargandoTareas] = useState(false)

  const unidades = modulos.flatMap((m) => m.unidadesFormativas ?? [])

  useEffect(() => {
    if (!unidadId && unidades.length > 0) {
      setUnidadId(unidades[0].id)
    }
  }, [unidades, unidadId])

  useEffect(() => {
    if (!unidadId) return
    setCargandoTareas(true)
    listarTareasDeUnidad(unidadId)
      .then(setTareas)
      .finally(() => setCargandoTareas(false))
  }, [unidadId])

  return (
    <main className={estilos.contenedor}>
      <h1>Mis tareas</h1>
      {cargandoModulos && <p role="status">Cargando tus módulos…</p>}
      {!cargandoModulos && unidades.length > 0 && (
        <div className={estilos.selector}>
          <label htmlFor="unidad-formativa">Unidad formativa</label>
          <select
            id="unidad-formativa"
            value={unidadId}
            onChange={(evento) => setUnidadId(evento.target.value)}
          >
            {unidades.map((uf) => (
              <option key={uf.id} value={uf.id}>
                {uf.codigo} — {uf.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
      {!cargandoModulos && unidades.length === 0 && <p>No estás matriculado en ningún módulo.</p>}

      {cargandoTareas && <p role="status">Cargando tareas…</p>}
      <ul className={estilos.listaTareas}>
        {tareas.map((tarea) => (
          <li key={tarea.id} className={estilos.filaTarea}>
            <div>
              <h2>{tarea.titulo}</h2>
              <p>Fecha límite: {new Date(tarea.fechaLimite).toLocaleString('es-ES')}</p>
            </div>
            <Link to={`/alumno/tareas/${tarea.id}/entregar`}>Entregar</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
