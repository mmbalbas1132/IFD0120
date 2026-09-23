// RF-014/RNF-002 (ver plan.md §6): el access token vive SOLO en memoria (estado de React), nunca
// en localStorage/sessionStorage. Al arrancar la aplicación se intenta recuperar la sesión con
// POST /auth/refresh (usa la cookie refresh_token, HttpOnly simulada) sin pedir credenciales de
// nuevo si la sesión mockeada sigue vigente.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, logout as logoutApi, refrescarSesion } from '../api/authApi.js'
import { fijarAccessToken } from '../api/httpClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargandoSesionInicial, setCargandoSesionInicial] = useState(true)
  const [errorSesion, setErrorSesion] = useState(null)

  useEffect(() => {
    let cancelado = false
    async function recuperarSesion() {
      try {
        const { accessToken, usuario: usuarioSesion } = await refrescarSesion()
        if (cancelado) return
        fijarAccessToken(accessToken)
        setUsuario(usuarioSesion)
      } catch {
        if (cancelado) return
        fijarAccessToken(null)
        setUsuario(null)
      } finally {
        if (!cancelado) setCargandoSesionInicial(false)
      }
    }
    recuperarSesion()
    return () => {
      cancelado = true
    }
  }, [])

  const iniciarSesion = useCallback(async (email, password) => {
    setErrorSesion(null)
    try {
      const { accessToken, usuario: usuarioSesion } = await loginApi(email, password)
      fijarAccessToken(accessToken)
      setUsuario(usuarioSesion)
      return usuarioSesion
    } catch (error) {
      setErrorSesion(error)
      throw error
    }
  }, [])

  // RF-017/RF-018: tras cambiar la contraseña desaparece la obligación de cambiarla.
  const marcarPasswordCambiada = useCallback(() => {
    setUsuario((actual) => (actual ? { ...actual, debeCambiarPassword: false } : actual))
  }, [])

  const cerrarSesion = useCallback(async () => {
    try {
      await logoutApi()
    } finally {
      fijarAccessToken(null)
      setUsuario(null)
    }
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      rol: usuario?.rol ?? null,
      autenticado: Boolean(usuario),
      debeCambiarPassword: Boolean(usuario?.debeCambiarPassword),
      cargandoSesionInicial,
      errorSesion,
      iniciarSesion,
      cerrarSesion,
      marcarPasswordCambiada,
    }),
    [
      usuario,
      cargandoSesionInicial,
      errorSesion,
      iniciarSesion,
      cerrarSesion,
      marcarPasswordCambiada,
    ],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}
