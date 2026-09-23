import estilos from './compartidos.module.css'

const CLASE_POR_TIPO = {
  error: estilos.alertaError,
  exito: estilos.alertaExito,
  aviso: estilos.alertaAviso,
}

/** aria-live="polite" para que lectores de pantalla anuncien el mensaje sin robar el foco. */
export default function Alerta({ tipo = 'aviso', children }) {
  if (!children) return null
  return (
    <div className={CLASE_POR_TIPO[tipo] ?? estilos.alertaAviso} role="alert" aria-live="polite">
      {children}
    </div>
  )
}
