import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import Boton from './Boton.jsx'
import estilos from './nav.module.css'

const ENLACES_POR_ROL = {
  ALUMNO: [
    { to: '/alumno/tareas', etiqueta: 'Mis tareas' },
    { to: '/alumno/calificaciones', etiqueta: 'Mis calificaciones' },
  ],
  DOCENTE: [
    { to: '/docente/tareas', etiqueta: 'Tareas' },
    { to: '/docente/recursos', etiqueta: 'Recursos' },
    { to: '/docente/anuncios', etiqueta: 'Anuncios' },
  ],
  ADMINISTRADOR: [
    { to: '/admin/usuarios', etiqueta: 'Usuarios' },
    { to: '/admin/modulos', etiqueta: 'Módulos' },
    { to: '/admin/matriculas', etiqueta: 'Matrículas' },
  ],
}

export default function NavPrincipal() {
  const { usuario, rol, cerrarSesion, debeCambiarPassword } = useAuth()
  const navegar = useNavigate()
  // RF-017: con el cambio de contraseña pendiente, el resto de páginas no están disponibles.
  const enlaces = debeCambiarPassword ? [] : (ENLACES_POR_ROL[rol] ?? [])

  async function alCerrarSesion() {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <nav className={estilos.nav} aria-label="Navegación principal">
      <NavLink to="/" className={estilos.marca}>
        GestorFP
      </NavLink>
      <ul className={estilos.lista}>
        {enlaces.map((enlace) => (
          <li key={enlace.to}>
            <NavLink
              to={enlace.to}
              className={({ isActive }) => (isActive ? estilos.enlaceActivo : estilos.enlace)}
            >
              {enlace.etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
      {usuario ? (
        <div className={estilos.sesion}>
          <span>
            {usuario.nombre} ({rol})
          </span>
          <NavLink
            to="/cambiar-password"
            className={({ isActive }) => (isActive ? estilos.enlaceActivo : estilos.enlace)}
          >
            Cambiar contraseña
          </NavLink>
          <Boton variante="secundario" type="button" onClick={alCerrarSesion}>
            Cerrar sesión
          </Boton>
        </div>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? estilos.enlaceActivo : estilos.enlace)}
        >
          Acceder
        </NavLink>
      )}
    </nav>
  )
}
