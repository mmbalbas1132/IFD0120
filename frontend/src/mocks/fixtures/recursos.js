// Fixtures de Recurso (spec.md §8): al menos los 3 tipos DOCUMENTO/VIDEO/ENLACE.
export const recursos = [
  {
    id: 'r-1',
    unidadFormativaId: 'uf-1',
    titulo: 'MDN - Fetch API',
    tipo: 'ENLACE',
    url: 'https://developer.mozilla.org/es/docs/Web/API/Fetch_API',
    descripcion: 'Referencia oficial de la API Fetch.',
    fechaPublicacion: '2026-09-02T09:00:00Z',
  },
  {
    id: 'r-2',
    unidadFormativaId: 'uf-1',
    titulo: 'Guía de formularios accesibles (PDF)',
    tipo: 'DOCUMENTO',
    url: '/recursos/guia-formularios-accesibles.pdf',
    descripcion: 'Checklist de accesibilidad para formularios web.',
    fechaPublicacion: '2026-09-03T09:00:00Z',
  },
  {
    id: 'r-3',
    unidadFormativaId: 'uf-2',
    titulo: 'Introducción a los Web Components',
    tipo: 'VIDEO',
    url: 'https://example.org/videos/web-components-intro',
    descripcion: 'Vídeo introductorio con subtítulos en español.',
    fechaPublicacion: '2026-09-16T09:00:00Z',
  },
]

export function recursosDeUnidad(unidadFormativaId) {
  return recursos.filter((r) => r.unidadFormativaId === unidadFormativaId)
}
