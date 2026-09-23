import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

/**
 * Guardia de rutas por rol. Si no hay sesión, redirige a /login. Si hay sesión pero el rol no
 * está en `rolesPermitidos`, redirige a "/" (nunca revela contenido de otro rol).
 */
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { autenticado, rol, cargandoSesionInicial } = useAuth()
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

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />
  }

  return children
}
