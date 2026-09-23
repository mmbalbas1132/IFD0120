// Fixtures de Modulo + UnidadFormativa (spec.md §8): 2 módulos con sus unidades formativas.
export const modulos = [
  {
    id: 'm-1',
    codigo: 'MF0491_3',
    nombre: 'Programación web en el entorno cliente',
    horas: 210,
    docenteResponsableId: 'u-docente-1',
  },
  {
    id: 'm-2',
    codigo: 'MF0492_3',
    nombre: 'Programación web en el entorno servidor',
    horas: 240,
    docenteResponsableId: 'u-docente-2',
  },
]

export const unidadesFormativas = [
  { id: 'uf-1', moduloId: 'm-1', codigo: 'UF1841', nombre: 'Elaboración de documentos web', horas: 60, orden: 1 },
  { id: 'uf-2', moduloId: 'm-1', codigo: 'UF1842', nombre: 'Elaboración de componentes software', horas: 90, orden: 2 },
  { id: 'uf-3', moduloId: 'm-1', codigo: 'UF1843', nombre: 'Integración de componentes software y accesibilidad', horas: 60, orden: 3 },
  { id: 'uf-4', moduloId: 'm-2', codigo: 'UF1844', nombre: 'Desarrollo de interfaces en entornos individuales', horas: 90, orden: 1 },
  { id: 'uf-5', moduloId: 'm-2', codigo: 'UF1845', nombre: 'Acceso a datos', horas: 90, orden: 2 },
  { id: 'uf-6', moduloId: 'm-2', codigo: 'UF1846', nombre: 'Servicios y procesos', horas: 60, orden: 3 },
]

export const matriculas = [
  { id: 'mat-1', alumnoId: 'u-alumno-1', moduloId: 'm-1', fechaMatricula: '2026-02-03', estado: 'ACTIVA' },
  { id: 'mat-2', alumnoId: 'u-alumno-2', moduloId: 'm-1', fechaMatricula: '2026-02-03', estado: 'ACTIVA' },
  { id: 'mat-3', alumnoId: 'u-alumno-1', moduloId: 'm-2', fechaMatricula: '2026-02-03', estado: 'ACTIVA' },
]

export function unidadesDeModulo(moduloId) {
  return unidadesFormativas.filter((uf) => uf.moduloId === moduloId).sort((a, b) => a.orden - b.orden)
}

export function modulosDeAlumno(alumnoId) {
  const idsModulo = matriculas
    .filter((m) => m.alumnoId === alumnoId && m.estado === 'ACTIVA')
    .map((m) => m.moduloId)
  return modulos.filter((m) => idsModulo.includes(m.id))
}

export function modulosDeDocente(docenteId) {
  return modulos.filter((m) => m.docenteResponsableId === docenteId)
}

export function alumnoMatriculadoEnModulo(alumnoId, moduloId) {
  return matriculas.some(
    (m) => m.alumnoId === alumnoId && m.moduloId === moduloId && m.estado === 'ACTIVA',
  )
}
