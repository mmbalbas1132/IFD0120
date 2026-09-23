// Fixtures de Adjunto (spec.md §8, RNF-014). El contenido es un texto corto que imita un PDF: basta
// para demostrar la descarga autenticada; no es un documento real.
export const adjuntos = [
  {
    id: 'adj-1',
    nombre: 'guia-formularios-accesibles.pdf',
    tipo: 'application/pdf',
    subidoPorId: 'u-docente-1',
    contenido: '%PDF-1.4\n% Guía de formularios accesibles (fichero de ejemplo del mock)\n',
  },
]

/** Representación pública de §12: nunca incluye el contenido ni su ubicación interna. */
export function serializarAdjuntoFixture({ id, nombre, tipo, contenido }) {
  return { id, nombre, tipo, tamano: new TextEncoder().encode(contenido).length }
}
