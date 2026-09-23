// HU-05 / RF-008: alta, edición y baja lógica de usuarios. Única área del cliente con Tailwind
// (ADR-0001, plan.md §5) — el resto del proyecto usa CSS Modules escritos a mano.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { crearUsuario, darDeBajaUsuario, listarUsuarios } from '../../api/usuariosApi.js'

const ROLES = ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO']

export default function TablaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [errorGeneral, setErrorGeneral] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { rol: 'ALUMNO' } })

  function recargar() {
    listarUsuarios().then((datos) => setUsuarios(datos.contenido))
  }

  useEffect(recargar, [])

  async function alEnviar(datos) {
    setErrorGeneral(null)
    try {
      await crearUsuario(datos)
      reset({ rol: 'ALUMNO' })
      recargar()
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  async function alDarDeBaja(id) {
    await darDeBajaUsuario(id)
    recargar()
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Usuarios</h1>

      {errorGeneral && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded border border-red-600 bg-red-50 p-3 text-red-700"
        >
          {errorGeneral}
        </div>
      )}

      <form onSubmit={handleSubmit(alEnviar)} noValidate className="mb-8 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="font-semibold text-slate-800">
            Nombre
          </label>
          <input
            id="nombre"
            className="rounded border border-slate-300 p-2"
            aria-invalid={errors.nombre ? 'true' : undefined}
            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre && (
            <span id="nombre-error" role="alert" className="text-sm text-red-700">
              {errors.nombre.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="apellidos" className="font-semibold text-slate-800">
            Apellidos
          </label>
          <input
            id="apellidos"
            className="rounded border border-slate-300 p-2"
            {...register('apellidos', { required: 'Los apellidos son obligatorios' })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-semibold text-slate-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="rounded border border-slate-300 p-2"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', { required: 'El email es obligatorio' })}
          />
          {errors.email && (
            <span id="email-error" role="alert" className="text-sm text-red-700">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="rol" className="font-semibold text-slate-800">
            Rol
          </label>
          <select id="rol" className="rounded border border-slate-300 p-2" {...register('rol')}>
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {isSubmitting ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>

      {/* TC.16: región enfocable para poder desplazar la tabla con teclado en móvil. */}
      <div
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        role="region"
        aria-label="Listado de usuarios"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-300">
              <th scope="col" className="p-2">
                Nombre
              </th>
              <th scope="col" className="p-2">
                Email
              </th>
              <th scope="col" className="p-2">
                Rol
              </th>
              <th scope="col" className="p-2">
                Estado
              </th>
              <th scope="col" className="p-2">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-slate-200">
                <td className="p-2">
                  {usuario.nombre} {usuario.apellidos}
                </td>
                <td className="p-2">{usuario.email}</td>
                <td className="p-2">{usuario.rol}</td>
                <td className="p-2">{usuario.activo ? 'Activo' : 'Baja'}</td>
                <td className="p-2">
                  {usuario.activo && (
                    <button
                      type="button"
                      onClick={() => alDarDeBaja(usuario.id)}
                      className="rounded border border-red-600 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                    >
                      Dar de baja
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
