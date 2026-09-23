// Fixtures de Entrega + Evaluacion embebida (spec.md §8: Evaluacion es 1–1 con Entrega).
// Cubre un caso de éxito por HU y un caso de borde (fuera de plazo) según exige TC.5.
export const entregas = [
  {
    id: 'e-1',
    tareaId: 't-2', // plazo ya vencido (2026-09-10) → entrega dentro de plazo, hecha antes de vencer
    alumnoId: 'u-alumno-1',
    fechaEntrega: '2026-09-08T18:30:00Z',
    adjunto: null,
    comentario: 'Landing entregada con 3 breakpoints verificados manualmente.',
    estado: 'CALIFICADA',
    evaluacion: {
      id: 'ev-1',
      calificacion: 8.5,
      observaciones: 'Buen uso de formularios accesibles.',
      evaluadorId: 'u-docente-1',
      fechaEvaluacion: '2026-09-12T10:00:00Z',
    },
  },
  {
    id: 'e-2',
    tareaId: 't-1', // plazo futuro (2026-10-15)
    alumnoId: 'u-alumno-1',
    fechaEntrega: '2026-09-18T12:00:00Z',
    adjunto: null,
    comentario: 'Formulario adjunto en el repositorio del alumno.',
    estado: 'ENTREGADA',
    evaluacion: null,
  },
  {
    id: 'e-3',
    // Caso de borde: entrega fuera de plazo (RF-004) — fechaEntrega posterior a fechaLimite de t-2
    tareaId: 't-2',
    alumnoId: 'u-alumno-2',
    fechaEntrega: '2026-09-16T09:00:00Z',
    adjunto: null,
    comentario: 'Entrega tardía por incidencia técnica.',
    estado: 'ENTREGADA_FUERA_DE_PLAZO',
    evaluacion: null,
  },
]

export function entregasDeTarea(tareaId) {
  return entregas.filter((e) => e.tareaId === tareaId)
}

export function entregasDeAlumno(alumnoId) {
  return entregas.filter((e) => e.alumnoId === alumnoId)
}

export function entregaDeAlumnoParaTarea(alumnoId, tareaId) {
  return entregas.find((e) => e.alumnoId === alumnoId && e.tareaId === tareaId)
}
