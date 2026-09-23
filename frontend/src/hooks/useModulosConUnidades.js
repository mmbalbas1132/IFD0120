// Hook compartido (alumno/docente): carga los módulos del usuario en sesión (ya filtrados por
// rol en el propio mock/API — ver mocks/handlers/modulos.js) junto a sus unidades formativas.
import { useEffect, useState } from 'react'
import { listarModulos } from '../api/modulosApi.js'

export function useModulosConUnidades() {
  const [modulos, setModulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    listarModulos()
      .then((datos) => {
        if (!cancelado) setModulos(datos)
      })
      .catch((err) => {
        if (!cancelado) setError(err.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  return { modulos, cargando, error }
}
