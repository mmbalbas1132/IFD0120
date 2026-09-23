// HU-05 / RF-009: crea módulos y sus unidades formativas; muestra el error 409 de código
// duplicado devuelto por el mock.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { crearModulo, crearUnidadFormativa, listarModulos } from '../../api/modulosApi.js'

export default function FormularioModulo() {
  const [modulos, setModulos] = useState([])
  const [errorModulo, setErrorModulo] = useState(null)
  const [errorUnidad, setErrorUnidad] = useState(null)
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState('')

  const formularioModulo = useForm()
  const formularioUnidad = useForm()

  function recargar() {
    listarModulos().then(setModulos)
  }

  useEffect(recargar, [])

  async function alCrearModulo(datos) {
    setErrorModulo(null)
    try {
      await crearModulo({ ...datos, horas: Number(datos.horas) })
      formularioModulo.reset()
      recargar()
    } catch (error) {
      setErrorModulo(error.message)
    }
  }

  async function alCrearUnidad(datos) {
    setErrorUnidad(null)
    if (!moduloSeleccionadoId) {
      setErrorUnidad('Selecciona primero un módulo.')
      return
    }
    try {
      await crearUnidadFormativa(moduloSeleccionadoId, { ...datos, horas: Number(datos.horas) })
      formularioUnidad.reset()
      recargar()
    } catch (error) {
      setErrorUnidad(error.message)
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Módulos</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Nuevo módulo</h2>
        {errorModulo && (
          <div role="alert" aria-live="polite" className="mb-3 rounded border border-red-600 bg-red-50 p-3 text-red-700">
            {errorModulo}
          </div>
        )}
        <form
          onSubmit={formularioModulo.handleSubmit(alCrearModulo)}
          noValidate
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="codigo" className="font-semibold text-slate-800">
              Código
            </label>
            <input
              id="codigo"
              className="rounded border border-slate-300 p-2"
              placeholder="MF0491_3"
              {...formularioModulo.register('codigo', { required: 'El código es obligatorio' })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre-modulo" className="font-semibold text-slate-800">
              Nombre
            </label>
            <input
              id="nombre-modulo"
              className="rounded border border-slate-300 p-2"
              {...formularioModulo.register('nombre', { required: 'El nombre es obligatorio' })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="horas-modulo" className="font-semibold text-slate-800">
              Horas
            </label>
            <input
              id="horas-modulo"
              type="number"
              min="1"
              className="rounded border border-slate-300 p-2"
              {...formularioModulo.register('horas', { required: 'Las horas son obligatorias' })}
            />
          </div>
          <button
            type="submit"
            disabled={formularioModulo.formState.isSubmitting}
            className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 sm:w-fit"
          >
            Crear módulo
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Nueva unidad formativa</h2>
        {errorUnidad && (
          <div role="alert" aria-live="polite" className="mb-3 rounded border border-red-600 bg-red-50 p-3 text-red-700">
            {errorUnidad}
          </div>
        )}
        <div className="mb-3 flex flex-col gap-1">
          <label htmlFor="modulo-destino" className="font-semibold text-slate-800">
            Módulo
          </label>
          <select
            id="modulo-destino"
            className="rounded border border-slate-300 p-2"
            value={moduloSeleccionadoId}
            onChange={(evento) => setModuloSeleccionadoId(evento.target.value)}
          >
            <option value="">Selecciona un módulo</option>
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <form
          onSubmit={formularioUnidad.handleSubmit(alCrearUnidad)}
          noValidate
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="codigo-uf" className="font-semibold text-slate-800">
              Código
            </label>
            <input
              id="codigo-uf"
              className="rounded border border-slate-300 p-2"
              placeholder="UF1841"
              {...formularioUnidad.register('codigo', { required: true })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre-uf" className="font-semibold text-slate-800">
              Nombre
            </label>
            <input
              id="nombre-uf"
              className="rounded border border-slate-300 p-2"
              {...formularioUnidad.register('nombre', { required: true })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="horas-uf" className="font-semibold text-slate-800">
              Horas
            </label>
            <input
              id="horas-uf"
              type="number"
              min="1"
              className="rounded border border-slate-300 p-2"
              {...formularioUnidad.register('horas', { required: true })}
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 sm:col-span-2 sm:w-fit"
          >
            Añadir unidad formativa
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Módulos existentes</h2>
        <ul className="flex flex-col gap-2">
          {modulos.map((m) => (
            <li key={m.id} className="rounded border border-slate-300 p-3">
              <strong>
                {m.codigo} — {m.nombre}
              </strong>{' '}
              ({m.horas}h)
              <ul className="ml-4 mt-1 list-disc text-sm text-slate-700">
                {(m.unidadesFormativas ?? []).map((uf) => (
                  <li key={uf.id}>
                    {uf.codigo} — {uf.nombre}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
