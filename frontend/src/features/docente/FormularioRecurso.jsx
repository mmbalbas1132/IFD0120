// HU-07 / RF-012: publica un recurso didáctico (DOCUMENTO, VIDEO o ENLACE) en una unidad
// formativa del módulo del docente. Un DOCUMENTO lleva un fichero subido; VIDEO y ENLACE, una URL.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useModulosConUnidades } from '../../hooks/useModulosConUnidades.js'
import { crearRecurso, listarRecursosDeUnidad } from '../../api/recursosApi.js'
import { ACCEPT_ADJUNTOS, validarFichero } from '../../utils/adjuntos.js'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import AdjuntoDescargable from '../../components/compartidos/AdjuntoDescargable.jsx'
import estilos from './docente.module.css'

const TIPOS = ['DOCUMENTO', 'VIDEO', 'ENLACE']

export default function FormularioRecurso() {
  const { modulos } = useModulosConUnidades()
  const unidades = modulos.flatMap((m) => m.unidadesFormativas ?? [])
  const [unidadId, setUnidadId] = useState('')
  const [recursos, setRecursos] = useState([])
  const [errorGeneral, setErrorGeneral] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { tipo: 'ENLACE' } })
  const esDocumento = watch('tipo') === 'DOCUMENTO'

  useEffect(() => {
    if (!unidadId && unidades.length > 0) setUnidadId(unidades[0].id)
  }, [unidades, unidadId])

  function recargar(id) {
    listarRecursosDeUnidad(id).then(setRecursos)
  }

  useEffect(() => {
    if (unidadId) recargar(unidadId)
  }, [unidadId])

  async function alEnviar(datos) {
    setErrorGeneral(null)
    try {
      const { titulo, tipo, descripcion, url, fichero } = datos
      await crearRecurso(
        unidadId,
        tipo === 'DOCUMENTO'
          ? { titulo, tipo, descripcion, fichero: fichero?.[0] }
          : { titulo, tipo, descripcion, url },
      )
      reset({ tipo: 'ENLACE' })
      recargar(unidadId)
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Publicar recurso didáctico</h1>
      {unidades.length > 1 && (
        <div className={estilos.selector}>
          <label htmlFor="unidad-formativa-recurso">Unidad formativa</label>
          <select
            id="unidad-formativa-recurso"
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
          etiqueta="Tipo"
          as="select"
          error={errors.tipo?.message}
          {...register('tipo', { required: true })}
        >
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </CampoTexto>
        {esDocumento ? (
          <CampoTexto
            etiqueta="Fichero"
            type="file"
            accept={ACCEPT_ADJUNTOS}
            ayuda="Un solo fichero de hasta 10 MB: PDF, ZIP, PNG, JPG, DOCX u ODT."
            error={errors.fichero?.message}
            {...register('fichero', {
              validate: (ficheros) => {
                if (getValues('tipo') !== 'DOCUMENTO') return true
                if (!ficheros?.[0]) return 'Un recurso de tipo DOCUMENTO necesita un fichero'
                return validarFichero(ficheros[0]) ?? true
              },
            })}
          />
        ) : (
          <CampoTexto
            etiqueta="URL"
            type="url"
            error={errors.url?.message}
            {...register('url', {
              validate: (valor) =>
                getValues('tipo') === 'DOCUMENTO' || Boolean(valor) || 'La URL es obligatoria',
            })}
          />
        )}
        <CampoTexto
          etiqueta="Descripción"
          as="textarea"
          rows={3}
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />
        <Boton type="submit" disabled={isSubmitting || !unidadId}>
          {isSubmitting ? 'Publicando…' : 'Publicar recurso'}
        </Boton>
      </form>

      <h2>Recursos publicados</h2>
      <ul className={estilos.listaRecursos}>
        {recursos.map((recurso) => (
          <li key={recurso.id} className={estilos.fila}>
            <div>
              <strong>{recurso.titulo}</strong> ({recurso.tipo})
              <p>
                {recurso.adjunto ? (
                  <AdjuntoDescargable adjunto={recurso.adjunto} />
                ) : (
                  <a href={recurso.url} target="_blank" rel="noreferrer">
                    {recurso.url}
                  </a>
                )}
              </p>
            </div>
          </li>
        ))}
        {recursos.length === 0 && <p>Todavía no hay recursos en esta unidad formativa.</p>}
      </ul>
    </main>
  )
}
