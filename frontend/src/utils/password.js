// RF-018: reglas de una contraseña nueva. Las valida el cliente antes de enviar y el servidor otra
// vez al recibirla; el mensaje indica la primera regla incumplida.
export const LONGITUD_MINIMA_PASSWORD = 8

export const REGLAS_PASSWORD =
  'Al menos 8 caracteres, con una mayúscula, un número y un símbolo, y distinta de la actual.'

/** Devuelve `null` si `nueva` cumple RF-018 o el mensaje de la regla que incumple. */
export function validarPasswordNueva(nueva, actual) {
  if (!nueva || nueva.length < LONGITUD_MINIMA_PASSWORD) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }
  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(nueva)) return 'La contraseña debe incluir al menos una mayúscula'
  if (!/[0-9]/.test(nueva)) return 'La contraseña debe incluir al menos un número'
  if (!/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/.test(nueva)) {
    return 'La contraseña debe incluir al menos un símbolo'
  }
  if (actual !== undefined && nueva === actual) {
    return 'La nueva contraseña debe ser distinta de la actual'
  }
  return null
}
