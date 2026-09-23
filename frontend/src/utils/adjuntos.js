// RNF-014: límites de los ficheros adjuntos. El cliente los valida antes de enviar (con mensaje
// accesible) y el servidor los vuelve a comprobar; el servidor real además verifica el tipo por el
// contenido del fichero, no solo por la extensión.
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024

export const TIPOS_PERMITIDOS = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
}

// Valor para el atributo `accept` del <input type="file">.
export const ACCEPT_ADJUNTOS = Object.keys(TIPOS_PERMITIDOS)
  .map((extension) => `.${extension}`)
  .join(',')

export const MENSAJE_TAMANO = 'El fichero no puede superar los 10 MB'
export const MENSAJE_TIPO = 'Tipo de fichero no permitido: usa PDF, ZIP, PNG, JPG, DOCX u ODT'

function extensionDe(nombre) {
  const punto = nombre.lastIndexOf('.')
  return punto === -1 ? '' : nombre.slice(punto + 1).toLowerCase()
}

/** Devuelve `null` si el fichero es válido o el mensaje de error de la regla que incumple. */
export function validarFichero(fichero) {
  if (!fichero) return null
  if (!TIPOS_PERMITIDOS[extensionDe(fichero.name)]) return MENSAJE_TIPO
  if (fichero.size > TAMANO_MAXIMO_BYTES) return MENSAJE_TAMANO
  return null
}

export function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
