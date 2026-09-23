// HU-08 / RF-013: publica un anuncio a nivel de módulo, con opción de marcarlo como destacado.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useModulosConUnidades } from '../../hooks/useModulosConUnidades.js'
import { crearAnuncio, listarAnunciosDeModulo } from '../../api/anunciosApi.js'
import CampoTexto from '../../components/compartidos/CampoTexto.jsx'
import Boton from '../../components/compartidos/Boton.jsx'
import Alerta from '../../components/compartidos/Alerta.jsx'
import estilos from './docente.module.css'

export default function FormularioAnuncio() {
  const { modulos } = useModulosConUnidades()
  const [moduloId, setModuloId] = useState('')
  const [anuncios, setAnuncios] = useState([])
  const [errorGeneral, setErrorGeneral] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!moduloId && modulos.length > 0) setModuloId(modulos[0].id)
  }, [modulos, moduloId])

  function recargar(id) {
    listarAnunciosDeModulo(id).then(setAnuncios)
  }

  useEffect(() => {
    if (moduloId) recargar(moduloId)
  }, [moduloId])

  async function alEnviar(datos) {
    setErrorGeneral(null)
    try {
      await crearAnuncio(moduloId, { ...datos, destacado: Boolean(datos.destacado) })
      reset()
      recargar(moduloId)
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Publicar anuncio</h1>
      {modulos.length > 1 && (
        <div className={estilos.selector}>
          <label htmlFor="modulo-anuncio">Módulo</label>
          <select
            id="modulo-anuncio"
            value={moduloId}
            onChange={(evento) => setModuloId(evento.target.value)}
          >
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
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
          etiqueta="Contenido"
          as="textarea"
          rows={4}
          error={errors.contenido?.message}
          {...register('contenido', { required: 'El contenido es obligatorio' })}
        />
        <div className={estilos.checkbox}>
          <input id="destacado" type="checkbox" {...register('destacado')} />
          <label htmlFor="destacado">Marcar como destacado</label>
        </div>
        <Boton type="submit" disabled={isSubmitting || !moduloId}>
          {isSubmitting ? 'Publicando…' : 'Publicar anuncio'}
        </Boton>
      </form>

      <h2>Anuncios publicados</h2>
      <ul className={estilos.listaAnuncios}>
        {anuncios.map((anuncio) => (
          <li
            key={anuncio.id}
            className={`${estilos.fila} ${anuncio.destacado ? estilos.destacado : ''}`}
          >
            <div>
              <strong>{anuncio.titulo}</strong>
              {anuncio.destacado && ' ⭐'}
              <p>{anuncio.contenido}</p>
            </div>
          </li>
        ))}
        {anuncios.length === 0 && <p>Todavía no hay anuncios en este módulo.</p>}
      </ul>
    </main>
  )
}
