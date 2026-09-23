// Fixtures de Tarea (spec.md §8). Fechas relativas a "hoy" simulado (2026-09-22) para poder
// demostrar tanto el caso de éxito (plazo futuro) como el de borde (plazo ya vencido).
export const tareas = [
  {
    id: 't-1',
    unidadFormativaId: 'uf-1',
    titulo: 'Maquetar formulario de contacto',
    descripcion: 'Formulario de contacto accesible con validación HTML5.',
    fechaPublicacion: '2026-09-01T09:00:00Z',
    fechaLimite: '2026-10-15T23:59:00Z',
    estado: 'PUBLICADA',
  },
  {
    id: 't-2',
    unidadFormativaId: 'uf-1',
    titulo: 'Maquetar landing responsive',
    descripcion: 'Landing page con mobile-first y 3 breakpoints.',
    fechaPublicacion: '2026-08-20T09:00:00Z',
    fechaLimite: '2026-09-10T23:59:00Z',
    estado: 'PUBLICADA',
  },
  {
    id: 't-3',
    unidadFormativaId: 'uf-2',
    titulo: 'Componente de calendario con JS vanilla',
    descripcion: 'Selector de fechas accesible sin librerías externas.',
    fechaPublicacion: '2026-09-15T09:00:00Z',
    fechaLimite: '2026-11-01T23:59:00Z',
    estado: 'PUBLICADA',
  },
  {
    id: 't-4',
    unidadFormativaId: 'uf-4',
    titulo: 'Interfaz de escritorio con formularios',
    descripcion: 'Prototipo de interfaz de gestión en entorno individual.',
    fechaPublicacion: '2026-09-10T09:00:00Z',
    fechaLimite: '2026-10-20T23:59:00Z',
    estado: 'PUBLICADA',
  },
]

export function tareasDeUnidad(unidadFormativaId) {
  return tareas.filter((t) => t.unidadFormativaId === unidadFormativaId)
}
