// RF-016: historial de cambios de la calificación de una entrega (del más reciente al más antiguo).
import { useId, useState } from 'react'
import { listarHistorialEvaluacion } from '../../api/evaluacionesApi.js'
import Alerta from '../../components/compartidos/Alerta.jsx'
import estilos from './docente.module.css'

function describirValor(calificacion, observaciones) {
  if (calificacion === null || calificacion === undefined) return 'sin calificar'
  return observaciones ? `${calificacion} («${observaciones}»)` : String(calificacion)
}

export default function HistorialCalificacion({ entregaId }) {
  const idPanel = useId()
  const [abierto, setAbierto] = useState(false)
  const [historial, setHistorial] = useState(null)
  const [error, setError] = useState(null)

  async function alternar() {
    const abrir = !abierto
    setAbierto(abrir)
    if (!abrir) return
    setError(null)
    try {
      setHistorial(await listarHistorialEvaluacion(entregaId))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <button type="button" aria-expanded={abierto} aria-controls={idPanel} onClick={alternar}>
        {abierto ? 'Ocultar historial' : 'Ver historial'}
      </button>
      <div id={idPanel} hidden={!abierto}>
        <Alerta tipo="error">{error}</Alerta>
        {abierto && !historial && !error && <p role="status">Cargando historial…</p>}
        {historial && (
          <ol className={estilos.historial} aria-label="Historial de la calificación">
            {historial.map((cambio) => (
              <li key={cambio.id}>
                {new Date(cambio.fechaCambio).toLocaleString('es-ES')} ·{' '}
                {cambio.autorCambioNombre ?? 'Autor desconocido'}:{' '}
                {describirValor(cambio.calificacionAnterior, cambio.observacionesAnteriores)} →{' '}
                {describirValor(cambio.calificacionNueva, cambio.observacionesNuevas)}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
