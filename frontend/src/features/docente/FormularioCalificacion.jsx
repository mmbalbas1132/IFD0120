// HU-03 / RF-005/RF-006: valida 0–10 (con un decimal) en cliente antes de enviar.
import { useForm } from 'react-hook-form'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import estilos from './docente.module.css'

export default function FormularioCalificacion({ entrega, onGuardado, onCancelar }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      calificacion: entrega.evaluacion?.calificacion ?? '',
      observaciones: entrega.evaluacion?.observaciones ?? '',
    },
  })

  async function alEnviar(datos) {
    await onGuardado(entrega.id, {
      calificacion: Number(datos.calificacion),
      observaciones: datos.observaciones,
    })
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate>
      <Alerta tipo="aviso">
        {entrega.estado === 'ENTREGADA_FUERA_DE_PLAZO' ? 'Entrega fuera de plazo.' : null}
      </Alerta>
      <CampoTexto
        etiqueta="Calificación (0–10)"
        type="number"
        step="0.1"
        min="0"
        max="10"
        error={errors.calificacion?.message}
        {...register('calificacion', {
          required: 'La calificación es obligatoria',
          min: { value: 0, message: 'La calificación debe estar entre 0 y 10' },
          max: { value: 10, message: 'La calificación debe estar entre 0 y 10' },
        })}
      />
      <CampoTexto
        etiqueta="Observaciones"
        as="textarea"
        rows={3}
        error={errors.observaciones?.message}
        {...register('observaciones')}
      />
      <div className={estilos.accionesFormulario}>
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar calificación'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </form>
  )
}
