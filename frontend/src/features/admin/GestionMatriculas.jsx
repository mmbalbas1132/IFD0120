// HU-05 / RF-010: matricula alumnado en módulos y permite consultar/revocar matriculaciones
// existentes (la lista de matrículas por módulo llega embebida en GET /modulos — ver la nota de
// mocks/handlers/modulos.js sobre el hueco de contrato en spec.md §12).
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { listarModulos } from '../../api/modulosApi.js'
import { listarUsuarios } from '../../api/usuariosApi.js'
import { crearMatricula, darDeBajaMatricula } from '../../api/matriculasApi.js'

export default function GestionMatriculas() {
  const [modulos, setModulos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [error, setError] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm()

  function recargar() {
    listarModulos().then(setModulos)
  }

  useEffect(() => {
    recargar()
    listarUsuarios().then((datos) =>
      setAlumnos(datos.contenido.filter((u) => u.rol === 'ALUMNO' && u.activo)),
    )
  }, [])

  async function alMatricular(datos) {
    setError(null)
    try {
      await crearMatricula(datos)
      reset()
      recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function alDarDeBaja(matriculaId) {
    await darDeBajaMatricula(matriculaId)
    recargar()
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Matrículas</h1>

      {error && (
        <div role="alert" aria-live="polite" className="mb-4 rounded border border-red-600 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(alMatricular)} noValidate className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="alumnoId" className="font-semibold text-slate-800">
            Alumno
          </label>
          <select id="alumnoId" className="rounded border border-slate-300 p-2" {...register('alumnoId', { required: true })}>
            <option value="">Selecciona un alumno</option>
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} {a.apellidos}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="moduloId" className="font-semibold text-slate-800">
            Módulo
          </label>
          <select id="moduloId" className="rounded border border-slate-300 p-2" {...register('moduloId', { required: true })}>
            <option value="">Selecciona un módulo</option>
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="self-end rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Matricular
        </button>
      </form>

      <h2 className="mb-2 text-lg font-semibold text-slate-800">Matrículas activas por módulo</h2>
      <ul className="flex flex-col gap-3">
        {modulos.map((m) => (
          <li key={m.id} className="rounded border border-slate-300 p-3">
            <strong>{m.nombre}</strong>
            <ul className="mt-2 flex flex-col gap-1">
              {(m.matriculas ?? []).map((mat) => (
                <li key={mat.id} className="flex items-center justify-between text-sm">
                  <span>{mat.alumnoNombre}</span>
                  <button
                    type="button"
                    onClick={() => alDarDeBaja(mat.id)}
                    className="rounded border border-red-600 px-2 py-1 text-red-700 hover:bg-red-50"
                  >
                    Dar de baja
                  </button>
                </li>
              ))}
              {(m.matriculas ?? []).length === 0 && (
                <li className="text-sm text-slate-500">Sin alumnado matriculado.</li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  )
}
