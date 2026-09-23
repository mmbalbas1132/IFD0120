// HU-03: lista las entregas de una tarea y permite calificarlas (delega en FormularioCalificacion).
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listarEntregasDeTarea } from '../../api/entregasApi.js'
import { calificarEntrega } from '../../api/evaluacionesApi.js'
import Alerta from '../../components/compartidos/Alerta.jsx'
import FormularioCalificacion from './FormularioCalificacion.jsx'
import estilos from './docente.module.css'

const ETIQUETA_ESTADO = {
  ENTREGADA: 'Entregada',
  ENTREGADA_FUERA_DE_PLAZO: 'Fuera de plazo',
  CALIFICADA: 'Calificada',
  PENDIENTE: 'Pendiente',
}

export default function ListaEntregas() {
  const { tareaId } = useParams()
  const [entregas, setEntregas] = useState([])
  const [entregaSeleccionadaId, setEntregaSeleccionadaId] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  function recargar() {
    setCargando(true)
    listarEntregasDeTarea(tareaId)
      .then(setEntregas)
      .finally(() => setCargando(false))
  }

  useEffect(recargar, [tareaId])

  async function alGuardarCalificacion(entregaId, datos) {
    setError(null)
    try {
      await calificarEntrega(entregaId, datos)
      setEntregaSeleccionadaId(null)
      recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargando) return <p role="status">Cargando entregas…</p>

  return (
    <main className={estilos.contenedor}>
      <h1>Entregas</h1>
      <Alerta tipo="error">{error}</Alerta>
      <ul className={estilos.listaEntregas}>
        {entregas.map((entrega) => (
          <li key={entrega.id} className={estilos.fila}>
            <div>
              <p>{ETIQUETA_ESTADO[entrega.estado] ?? entrega.estado}</p>
              <p>Entregada: {new Date(entrega.fechaEntrega).toLocaleString('es-ES')}</p>
              {entrega.comentario && <p>«{entrega.comentario}»</p>}
              {entrega.evaluacion && (
                <p>
                  Nota actual: {entrega.evaluacion.calificacion} — {entrega.evaluacion.observaciones}
                </p>
              )}
            </div>
            {entregaSeleccionadaId === entrega.id ? (
              <FormularioCalificacion
                entrega={entrega}
                onGuardado={alGuardarCalificacion}
                onCancelar={() => setEntregaSeleccionadaId(null)}
              />
            ) : (
              <button type="button" onClick={() => setEntregaSeleccionadaId(entrega.id)}>
                {entrega.evaluacion ? 'Editar calificación' : 'Calificar'}
              </button>
            )}
          </li>
        ))}
        {entregas.length === 0 && <p>Todavía no hay entregas para esta tarea.</p>}
      </ul>
    </main>
  )
}
