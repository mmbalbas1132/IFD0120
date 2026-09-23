// HU-02 / RF-003/RF-004: sube fichero y/o comentario; el estado fuera de plazo lo decide el
// servidor (mock) y se muestra aquí tal cual llega.
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { crearEntrega } from '../../api/entregasApi.js'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import estilos from './alumno.module.css'

const ETIQUETA_ESTADO = {
  ENTREGADA: { texto: 'Entregada dentro de plazo', clase: 'estadoEntregada' },
  ENTREGADA_FUERA_DE_PLAZO: { texto: 'Entregada fuera de plazo', clase: 'estadoFueraDePlazo' },
}

export default function FormularioEntrega() {
  const { tareaId } = useParams()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const [entregaGuardada, setEntregaGuardada] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)

  async function alEnviar(datos) {
    setErrorGeneral(null)
    if (!datos.ficheroUrl && !datos.comentario) {
      setErrorGeneral('Adjunta un fichero (URL) o escribe un comentario.')
      return
    }
    try {
      const entrega = await crearEntrega(tareaId, {
        ficheroUrl: datos.ficheroUrl || null,
        comentario: datos.comentario,
      })
      setEntregaGuardada(entrega)
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  if (entregaGuardada) {
    const info = ETIQUETA_ESTADO[entregaGuardada.estado]
    return (
      <main className={estilos.contenedor}>
        <h1>Entrega registrada</h1>
        <p className={estilos[info.clase]}>{info.texto}</p>
        <p>
          Fecha y hora exacta:{' '}
          {new Date(entregaGuardada.fechaEntrega).toLocaleString('es-ES')}
        </p>
      </main>
    )
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Entregar tarea</h1>
      <Alerta tipo="error">{errorGeneral}</Alerta>
      <form onSubmit={handleSubmit(alEnviar)} noValidate>
        <CampoTexto
          etiqueta="URL del fichero (opcional si añades comentario)"
          type="url"
          error={errors.ficheroUrl?.message}
          {...register('ficheroUrl')}
        />
        <CampoTexto
          etiqueta="Comentario (opcional si adjuntas fichero)"
          as="textarea"
          rows={4}
          error={errors.comentario?.message}
          {...register('comentario')}
        />
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Confirmar entrega'}
        </Boton>
      </form>
    </main>
  )
}
