import { forwardRef, useId } from 'react'
import estilos from './compartidos.module.css'

/**
 * Campo de formulario accesible: <label htmlFor> asociado, aria-describedby hacia el mensaje de
 * error (Principio 4 / RNF-004). Compatible con `register()` de React Hook Form vía `ref`.
 */
const CampoTexto = forwardRef(function CampoTexto(
  { etiqueta, error, tipo = 'text', as = 'input', id, ...resto },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`
  const Elemento = as

  return (
    <div className={estilos.campo}>
      <label htmlFor={idCampo} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      <Elemento
        id={idCampo}
        ref={ref}
        type={as === 'input' ? tipo : undefined}
        className={error ? estilos.entradaConError : estilos.entrada}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? idError : undefined}
        {...resto}
      />
      {error && (
        <span id={idError} role="alert" className={estilos.mensajeError}>
          {error}
        </span>
      )}
    </div>
  )
})

export default CampoTexto
