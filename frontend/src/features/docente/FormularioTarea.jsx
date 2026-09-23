// HU-01 / RF-001/RF-002: crea una tarea en una unidad formativa del módulo del docente y lista
// las ya publicadas. Validación de fecha límite futura en cliente, con mensaje accesible.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useModulosConUnidades } from '../../hooks/useModulosConUnidades.js'
import { crearTarea, listarTareasDeUnidad } from '../../api/tareasApi.js'
import { ACCEPT_ADJUNTOS, validarFichero } from '../../utils/adjuntos.js'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import AdjuntoDescargable from '../../components/compartidos/AdjuntoDescargable.jsx'
import estilos from './docente.module.css'

export default function FormularioTarea() {
  const { modulos } = useModulosConUnidades()
  const unidades = modulos.flatMap((m) => m.unidadesFormativas ?? [])
  const [unidadId, setUnidadId] = useState('')
  const [tareas, setTareas] = useState([])
  const [errorGeneral, setErrorGeneral] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!unidadId && unidades.length > 0) setUnidadId(unidades[0].id)
  }, [unidades, unidadId])

  function recargarTareas(id) {
    listarTareasDeUnidad(id).then(setTareas)
  }

  useEffect(() => {
    if (unidadId) recargarTareas(unidadId)
  }, [unidadId])

  async function alEnviar(datos) {
    setErrorGeneral(null)
    try {
      await crearTarea(unidadId, { ...datos, fichero: datos.fichero?.[0] }) // RF-001, RNF-014
      reset()
      recargarTareas(unidadId)
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  const hoyISO = new Date().toISOString().slice(0, 16)

  return (
    <main className={estilos.contenedor}>
      <h1>Publicar tarea</h1>
      {unidades.length > 1 && (
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

      <Alerta tipo="error">{errorGeneral}</Alerta>
      <form onSubmit={handleSubmit(alEnviar)} noValidate>
        <CampoTexto
          etiqueta="Título"
          error={errors.titulo?.message}
          {...register('titulo', { required: 'El título es obligatorio' })}
        />
        <CampoTexto
          etiqueta="Descripción"
          as="textarea"
          rows={3}
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />
        <CampoTexto
          etiqueta="Fecha límite"
          type="datetime-local"
          error={errors.fechaLimite?.message}
          {...register('fechaLimite', {
            required: 'La fecha límite es obligatoria',
            validate: (valor) =>
              valor > hoyISO || 'La fecha límite debe ser posterior a la fecha actual',
          })}
        />
        <CampoTexto
          etiqueta="Fichero adjunto (opcional)"
          type="file"
          accept={ACCEPT_ADJUNTOS}
          ayuda="Un solo fichero de hasta 10 MB: PDF, ZIP, PNG, JPG, DOCX u ODT."
          error={errors.fichero?.message}
          {...register('fichero', {
            validate: (ficheros) => validarFichero(ficheros?.[0]) ?? true,
          })}
        />
        <Boton type="submit" disabled={isSubmitting || !unidadId}>
          {isSubmitting ? 'Publicando…' : 'Publicar tarea'}
        </Boton>
      </form>

      <h2>Tareas publicadas</h2>
      <ul className={estilos.listaTareas}>
        {tareas.map((tarea) => (
          <li key={tarea.id} className={estilos.fila}>
            <div>
              <strong>{tarea.titulo}</strong>
              <p>Fecha límite: {new Date(tarea.fechaLimite).toLocaleString('es-ES')}</p>
              <AdjuntoDescargable adjunto={tarea.adjunto} />
            </div>
            <Link to={`/docente/tareas/${tarea.id}/entregas`}>Ver entregas</Link>
          </li>
        ))}
        {tareas.length === 0 && <p>Todavía no hay tareas en esta unidad formativa.</p>}
      </ul>
    </main>
  )
}
