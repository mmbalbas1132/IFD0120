import { useState } from 'react'
import { descargarAdjunto } from '../../api/adjuntosApi.js'
import { formatearTamano } from '../../utils/adjuntos.js'
import Alerta from './Alerta.jsx'
import estilos from './compartidos.module.css'

/** RNF-014: descarga autenticada de un adjunto (GET /adjuntos/{id}). */
export default function AdjuntoDescargable({ adjunto }) {
  const [error, setError] = useState(null)
  if (!adjunto) return null

  async function alDescargar() {
    setError(null)
    try {
      await descargarAdjunto(adjunto)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <button type="button" className={estilos.botonDescarga} onClick={alDescargar}>
        Descargar {adjunto.nombre} ({formatearTamano(adjunto.tamano)})
      </button>
      <Alerta tipo="error">{error}</Alerta>
    </>
  )
}
