import { httpClient } from './httpClient.js'

// RNF-014: la descarga necesita la cabecera Authorization, así que no puede ser un <a href> plano:
// se pide el fichero con httpClient y se entrega al navegador mediante una URL de objeto temporal.
export async function descargarAdjunto(adjunto) {
  const blob = await httpClient(`/adjuntos/${adjunto.id}`, { comoBlob: true })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = adjunto.nombre
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
