// RF-018: cambio de la propia contraseña, para todos los roles. También es el paso obligatorio tras
// un restablecimiento del ADMINISTRADOR (RF-017): mientras esté pendiente, RutaProtegida trae aquí.
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { cambiarPassword } from '../api/usuariosApi.js'
import { REGLAS_PASSWORD, validarPasswordNueva } from '../utils/password.js'
import { RUTA_POR_ROL } from './rutas.js'
import CampoTexto from '../components/compartidos/CampoTexto.jsx'
import Boton from '../components/compartidos/Boton.jsx'
import Alerta from '../components/compartidos/Alerta.jsx'
import estilos from './auth.module.css'

export default function PaginaCambiarPassword() {
  const { usuario, debeCambiarPassword, marcarPasswordCambiada } = useAuth()
  const navegar = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [exito, setExito] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  async function alEnviar(datos) {
    setErrorGeneral(null)
    setExito(false)
    try {
      await cambiarPassword(usuario.id, datos.passwordActual, datos.passwordNueva)
      const eraObligatorio = debeCambiarPassword
      marcarPasswordCambiada()
      reset()
      if (eraObligatorio) {
        navegar(RUTA_POR_ROL[usuario.rol] ?? '/', { replace: true })
      } else {
        setExito(true)
      }
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  return (
    <main className={estilos.contenedor}>
      <h1>Cambiar contraseña</h1>
      {debeCambiarPassword && (
        <Alerta tipo="aviso">
          Estás usando una contraseña temporal. Cámbiala para poder seguir usando GestorFP.
        </Alerta>
      )}
      <Alerta tipo="exito">{exito ? 'Contraseña cambiada correctamente.' : null}</Alerta>
      <Alerta tipo="error">{errorGeneral}</Alerta>
      <form onSubmit={handleSubmit(alEnviar)} noValidate>
        <CampoTexto
          etiqueta={debeCambiarPassword ? 'Contraseña temporal' : 'Contraseña actual'}
          type="password"
          autoComplete="current-password"
          error={errors.passwordActual?.message}
          {...register('passwordActual', { required: 'La contraseña actual es obligatoria' })}
        />
        <CampoTexto
          etiqueta="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          ayuda={REGLAS_PASSWORD}
          error={errors.passwordNueva?.message}
          {...register('passwordNueva', {
            validate: (valor) => validarPasswordNueva(valor, getValues('passwordActual')) ?? true,
          })}
        />
        <CampoTexto
          etiqueta="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.passwordRepetida?.message}
          {...register('passwordRepetida', {
            validate: (valor) =>
              valor === getValues('passwordNueva') || 'Las contraseñas no coinciden',
          })}
        />
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
        </Boton>
      </form>
    </main>
  )
}
