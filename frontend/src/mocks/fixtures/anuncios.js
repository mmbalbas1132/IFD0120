// Fixtures de Anuncio (spec.md §8): incluye uno destacado para verificar HU-08.
export const anuncios = [
  {
    id: 'an-1',
    moduloId: 'm-1',
    autorId: 'u-docente-1',
    titulo: 'Cambio de aula',
    contenido: 'A partir del lunes las clases se imparten en el aula 2.3.',
    fechaPublicacion: '2026-09-19T08:00:00Z',
    destacado: true,
  },
  {
    id: 'an-2',
    moduloId: 'm-1',
    autorId: 'u-docente-1',
    titulo: 'Recordatorio de entrega',
    contenido: 'Revisad la fecha límite de la tarea de landing responsive.',
    fechaPublicacion: '2026-09-05T08:00:00Z',
    destacado: false,
  },
]

export function anunciosDeModulo(moduloId) {
  return anuncios
    .filter((a) => a.moduloId === moduloId)
    .sort((a, b) => {
      if (a.destacado !== b.destacado) return a.destacado ? -1 : 1
      return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
    })
}
