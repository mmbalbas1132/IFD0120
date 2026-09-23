import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { CONTRASENA_SIMULADA } from '../src/mocks/fixtures/usuarios.js'

// TC.19: el build de producción no debe contener el mock de API ni sus credenciales simuladas,
// aunque se construya sin VITE_API_BASE_URL y heredando NODE_ENV=test de Vitest (casos
// desfavorables: sin API real configurada y con NODE_ENV distinto de production).
const raiz = resolve(__dirname, '..')
let outDir
let contenidoBundle

function listarFicheros(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name)
    return entrada.isDirectory() ? listarFicheros(ruta) : [ruta]
  })
}

describe('build de producción (TC.19)', () => {
  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'gestorfp-build-'))
    const entorno = { ...process.env }
    delete entorno.VITE_API_BASE_URL
    execFileSync(
      process.execPath,
      [join(raiz, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', outDir, '--emptyOutDir'],
      { cwd: raiz, env: entorno, stdio: 'pipe' },
    )
    contenidoBundle = listarFicheros(outDir)
      .map((fichero) => readFileSync(fichero, 'utf-8'))
      .join('\n')
  }, 120_000)

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true })
  })

  it('no incluye la contraseña simulada ni los emails de las fixtures', () => {
    expect(contenidoBundle).not.toContain(CONTRASENA_SIMULADA)
    expect(contenidoBundle).not.toContain('@gestorfp.test')
  })

  it('no incluye el código de MSW', () => {
    expect(contenidoBundle).not.toContain('setupWorker')
    expect(contenidoBundle).not.toContain('mockServiceWorker')
  })

  it('no publica el service worker de MSW', () => {
    expect(existsSync(join(outDir, 'mockServiceWorker.js'))).toBe(false)
  })
})
