// Fixtures de Usuario (spec.md §8). Contraseña simulada para todos: "Password123!".
export const usuarios = [
  {
    id: 'u-admin-1',
    nombre: 'Elena',
    apellidos: 'Ferreiro Castro',
    email: 'admin@gestorfp.test',
    rol: 'ADMINISTRADOR',
    activo: true,
    debeCambiarPassword: false,
    fechaAlta: '2026-01-10',
  },
  {
    id: 'u-docente-1',
    nombre: 'Marcos',
    apellidos: 'Iglesias Pena',
    email: 'docente1@gestorfp.test',
    rol: 'DOCENTE',
    activo: true,
    debeCambiarPassword: false,
    fechaAlta: '2026-01-12',
  },
  {
    id: 'u-docente-2',
    nombre: 'Sabela',
    apellidos: 'Vidal Mosquera',
    email: 'docente2@gestorfp.test',
    rol: 'DOCENTE',
    activo: true,
    debeCambiarPassword: false,
    fechaAlta: '2026-01-12',
  },
  {
    id: 'u-alumno-1',
    nombre: 'Iago',
    apellidos: 'Barreiro Cid',
    email: 'alumno1@gestorfp.test',
    rol: 'ALUMNO',
    activo: true,
    debeCambiarPassword: false,
    fechaAlta: '2026-02-01',
  },
  {
    id: 'u-alumno-2',
    nombre: 'Noa',
    apellidos: 'Domínguez Rey',
    email: 'alumno2@gestorfp.test',
    rol: 'ALUMNO',
    activo: true,
    debeCambiarPassword: false,
    fechaAlta: '2026-02-01',
  },
]

export const CONTRASENA_SIMULADA = 'Password123!'

export function buscarUsuarioPorEmail(email) {
  return usuarios.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
}

export function buscarUsuarioPorId(id) {
  return usuarios.find((u) => u.id === id)
}
