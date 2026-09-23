import { describe, it, expect } from 'vitest'
import { login } from '../../api/authApi.js'
import { fijarAccessToken } from '../../api/httpClient.js'
import { listarTareasDeUnidad } from '../../api/tareasApi.js'
import { cambiarPassword, restablecerPassword } from '../../api/usuariosApi.js'
import { validarPasswordNueva } from '../../utils/password.js'
import { autenticarComo } from '../../../tests/utils.jsx'

async function entrarCon(email, password) {
  const { accessToken, usuario } = await login(email, password)
  fijarAccessToken(accessToken)
  return usuario
}

describe('restablecimiento y cambio de contraseña en el mock (RF-017, RF-018)', () => {
  it('genera una temporal que cumple RF-018 y obliga a cambiarla (TC.23)', async () => {
    await autenticarComo('ADMINISTRADOR')
    const { passwordTemporal } = await restablecerPassword('u-alumno-1')
    expect(validarPasswordNueva(passwordTemporal)).toBeNull()

    const usuario = await entrarCon('alumno1@gestorfp.test', passwordTemporal)
    expect(usuario.debeCambiarPassword).toBe(true)
    await expect(listarTareasDeUnidad('uf-1')).rejects.toMatchObject({
      status: 403,
      error: 'CAMBIO_PASSWORD_REQUERIDO',
    })

    await cambiarPassword('u-alumno-1', passwordTemporal, 'NuevaClave1!')
    await expect(listarTareasDeUnidad('uf-1')).resolves.toBeInstanceOf(Array)
    const trasCambio = await entrarCon('alumno1@gestorfp.test', 'NuevaClave1!')
    expect(trasCambio.debeCambiarPassword).toBe(false)
  })

  it('invalida la contraseña anterior al restablecer', async () => {
    await autenticarComo('ADMINISTRADOR')
    await restablecerPassword('u-alumno-1')
    await expect(login('alumno1@gestorfp.test', 'Password123!')).rejects.toMatchObject({
      status: 401,
    })
  })

  it('rechaza con 400 una contraseña nueva que incumple RF-018', async () => {
    await autenticarComo('ALUMNO')
    await expect(cambiarPassword('u-alumno-1', 'Password123!', 'corta')).rejects.toMatchObject({
      status: 400,
      message: 'La contraseña debe tener al menos 8 caracteres',
    })
  })

  it('rechaza con 400 si la contraseña actual no es correcta', async () => {
    await autenticarComo('ALUMNO')
    await expect(
      cambiarPassword('u-alumno-1', 'Incorrecta1!', 'NuevaClave1!'),
    ).rejects.toMatchObject({ status: 400, message: 'La contraseña actual no es correcta' })
  })

  it('solo el ADMINISTRADOR puede restablecer contraseñas', async () => {
    await autenticarComo('DOCENTE')
    await expect(restablecerPassword('u-alumno-1')).rejects.toMatchObject({ status: 403 })
  })
})

describe('validarPasswordNueva (RF-018)', () => {
  it.each([
    ['Ab1!', 'La contraseña debe tener al menos 8 caracteres'],
    ['minuscula1!', 'La contraseña debe incluir al menos una mayúscula'],
    ['SinNumero!', 'La contraseña debe incluir al menos un número'],
    ['SinSimbolo1', 'La contraseña debe incluir al menos un símbolo'],
  ])('rechaza %s', (password, mensaje) => {
    expect(validarPasswordNueva(password)).toBe(mensaje)
  })

  it('rechaza repetir la contraseña actual', () => {
    expect(validarPasswordNueva('Valida123!', 'Valida123!')).toBe(
      'La nueva contraseña debe ser distinta de la actual',
    )
  })

  it('acepta una contraseña que cumple todas las reglas', () => {
    expect(validarPasswordNueva('Valida123!', 'Otra456?')).toBeNull()
  })
})
