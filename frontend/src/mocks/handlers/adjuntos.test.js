import { describe, it, expect } from 'vitest'
import { crearEntrega } from '../../api/entregasApi.js'
import { httpClient } from '../../api/httpClient.js'
import { autenticarComo } from '../../../tests/utils.jsx'

// TC.20: el mock aplica RNF-014 aunque el cliente se salte su propia validación, y la descarga
// respeta los permisos del elemento al que pertenece el adjunto.
describe('adjuntos en el mock (RNF-014, §12)', () => {
  it('responde 413 si el fichero supera los 10 MB', async () => {
    await autenticarComo('ALUMNO')
    const grande = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf', {
      type: 'application/pdf',
    })
    await expect(crearEntrega('t-3', { fichero: grande })).rejects.toMatchObject({ status: 413 })
  })

  it('responde 415 si el tipo de fichero no está permitido', async () => {
    await autenticarComo('ALUMNO')
    const ejecutable = new File(['MZ'], 'programa.exe', { type: 'application/octet-stream' })
    await expect(crearEntrega('t-3', { fichero: ejecutable })).rejects.toMatchObject({
      status: 415,
    })
  })

  it('la entrega guarda el fichero y su autor puede descargarlo', async () => {
    await autenticarComo('ALUMNO')
    const fichero = new File(['hola'], 'memoria.pdf', { type: 'application/pdf' })
    const entrega = await crearEntrega('t-3', { fichero })

    expect(entrega.adjunto).toMatchObject({ nombre: 'memoria.pdf', tamano: 4 })
    const blob = await httpClient(`/adjuntos/${entrega.adjunto.id}`, { comoBlob: true })
    expect(await blob.text()).toBe('hola')
  })

  it('niega la descarga del adjunto de una entrega a quien no es su autor ni su docente', async () => {
    await autenticarComo('ALUMNO')
    const fichero = new File(['privado'], 'privado.pdf', { type: 'application/pdf' })
    const entrega = await crearEntrega('t-3', { fichero })

    await autenticarComo('ADMINISTRADOR')
    await expect(
      httpClient(`/adjuntos/${entrega.adjunto.id}`, { comoBlob: true }),
    ).rejects.toMatchObject({ status: 403 })
  })
})
