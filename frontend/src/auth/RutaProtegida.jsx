import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { RUTA_CAMBIAR_PASSWORD } from './rutas.js'

/**
 * Guardia de rutas por rol. Si no hay sesión, redirige a /login. Si hay sesión pero el rol no
 * está en `rolesPermitidos`, redirige a "/" (nunca revela contenido de otro rol). Si el usuario
 * tiene que cambiar la contraseña (RF-017), toda ruta protegida lleva a la página de cambio.
 */
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { autenticado, rol, cargandoSesionInicial, debeCambiarPassword } = useAuth()
  const location = useLocation()

  if (cargandoSesionInicial) {
    return (
      <p role="status" aria-live="polite">
        Comprobando sesión…
      </p>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: location }} replace />
  }

  if (debeCambiarPassword && location.pathname !== RUTA_CAMBIAR_PASSWORD) {
    return <Navigate to={RUTA_CAMBIAR_PASSWORD} replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />
  }

  return children
}
