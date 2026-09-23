// HU-02 / RF-003/RF-004: sube un fichero y/o comentario; el estado fuera de plazo lo decide el
// servidor (mock) y se muestra aquí tal cual llega. Una entrega por alumno y tarea: si ya existe y
// no está calificada, la nueva la reemplaza; si está calificada, no se puede reemplazar.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { crearEntrega } from '../../api/entregasApi.js'
import { listarCalificacionesDeAlumno } from '../../api/evaluacionesApi.js'
import { ACCEPT_ADJUNTOS, validarFichero } from '../../utils/adjuntos.js'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import AdjuntoDescargable from '../../components/compartidos/AdjuntoDescargable.jsx'
import estilos from './alumno.module.css'

const ETIQUETA_ESTADO = {
  ENTREGADA: { texto: 'Entregada dentro de plazo', clase: 'estadoEntregada' },
  ENTREGADA_FUERA_DE_PLAZO: { texto: 'Entregada fuera de plazo', clase: 'estadoFueraDePlazo' },
}

const AYUDA_FICHERO = 'Un solo fichero de hasta 10 MB: PDF, ZIP, PNG, JPG, DOCX u ODT.'

function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-ES')
}

export default function FormularioEntrega() {
  const { tareaId } = useParams()
  const { usuario } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const [entregaPrevia, setEntregaPrevia] = useState(undefined) // undefined = cargando
  const [entregaGuardada, setEntregaGuardada] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)

  useEffect(() => {
    if (!usuario) return
    listarCalificacionesDeAlumno(usuario.id)
      .then((entregas) => setEntregaPrevia(entregas.find((e) => e.tareaId === tareaId) ?? null))
      .catch(() => setEntregaPrevia(null))
  }, [usuario, tareaId])

  async function alEnviar(datos) {
    setErrorGeneral(null)
    const fichero = datos.fichero?.[0] ?? null
    if (!fichero && !datos.comentario?.trim()) {
      setErrorGeneral('Adjunta un fichero o escribe un comentario.')
      return
    }
    try {
      const entrega = await crearEntrega(tareaId, { fichero, comentario: datos.comentario })
      setEntregaGuardada(entrega)
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  if (entregaPrevia === undefined) return <p role="status">Cargando entrega…</p>

  if (entregaGuardada) {
    const info = ETIQUETA_ESTADO[entregaGuardada.estado]
    return (
      <main className={estilos.contenedor}>
        <h1>{entregaPrevia ? 'Entrega reemplazada' : 'Entrega registrada'}</h1>
        <p className={estilos[info.clase]}>{info.texto}</p>
        <p>Fecha y hora exacta: {formatearFecha(entregaGuardada.fechaEntrega)}</p>
        {entregaGuardada.adjunto && (
          <p>
            <AdjuntoDescargable adjunto={entregaGuardada.adjunto} />
          </p>
        )}
      </main>
    )
  }

  if (entregaPrevia?.estado === 'CALIFICADA') {
    return (
      <main className={estilos.contenedor}>
        <h1>Entregar tarea</h1>
        <Alerta tipo="aviso">
          Esta entrega ya está calificada y no se puede reemplazar. Puedes ver la nota en Mis
          calificaciones.
        </Alerta>
      </main>
    )
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Entregar tarea</h1>
      {entregaPrevia && (
        <div className={estilos.entregaPrevia}>
          <p>
            Ya entregaste esta tarea el {formatearFecha(entregaPrevia.fechaEntrega)}. Si vuelves a
            entregarla, la nueva entrega sustituirá a la anterior, incluido su fichero.
          </p>
          {entregaPrevia.adjunto && <AdjuntoDescargable adjunto={entregaPrevia.adjunto} />}
        </div>
      )}
      <Alerta tipo="error">{errorGeneral}</Alerta>
      <form onSubmit={handleSubmit(alEnviar)} noValidate>
        <CampoTexto
          etiqueta="Fichero (opcional si añades comentario)"
          type="file"
          accept={ACCEPT_ADJUNTOS}
          ayuda={AYUDA_FICHERO}
          error={errors.fichero?.message}
          {...register('fichero', {
            validate: (ficheros) => validarFichero(ficheros?.[0]) ?? true,
          })}
        />
        <CampoTexto
          etiqueta="Comentario (opcional si adjuntas fichero)"
          as="textarea"
          rows={4}
          error={errors.comentario?.message}
          {...register('comentario')}
        />
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : entregaPrevia ? 'Reemplazar entrega' : 'Confirmar entrega'}
        </Boton>
      </form>
    </main>
  )
}
