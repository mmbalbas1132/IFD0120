import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import CampoTexto from '../components/compartidos/CampoTexto.jsx'
import Boton from '../components/compartidos/Boton.jsx'
import Alerta from '../components/compartidos/Alerta.jsx'
import estilos from './auth.module.css'

const RUTA_POR_ROL = {
  ADMINISTRADOR: '/admin/usuarios',
  DOCENTE: '/docente/tareas',
  ALUMNO: '/alumno/tareas',
}

export default function PaginaLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const location = useLocation()
  const [errorGeneral, setErrorGeneral] = useState(null)

  async function alEnviar(datos) {
    setErrorGeneral(null)
    try {
      const usuario = await iniciarSesion(datos.email, datos.password)
      const destino = location.state?.desde?.pathname ?? RUTA_POR_ROL[usuario.rol] ?? '/'
      navegar(destino, { replace: true })
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Acceder a GestorFP</h1>
      <Alerta tipo="error">{errorGeneral}</Alerta>
      <form onSubmit={handleSubmit(alEnviar)} noValidate>
        <CampoTexto
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="username"
          error={errors.email?.message}
          {...register('email', { required: 'El correo electrónico es obligatorio' })}
        />
        <CampoTexto
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'La contraseña es obligatoria' })}
        />
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Accediendo…' : 'Acceder'}
        </Boton>
      </form>
    </main>
  )
}

