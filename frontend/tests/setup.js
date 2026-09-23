import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect' // TC.15: expect(...).toHaveNoViolations()
import { afterAll, afterEach, beforeAll } from 'vitest'
import { Blob as BlobNode, File as FileNode } from 'node:buffer'
import { server } from '../src/mocks/server.js'
import { resetearDb } from '../src/mocks/db.js'

// jsdom trae su propio FormData/File/Blob, que el fetch de Node (undici) no sabe serializar: una
// subida multipart (RNF-014) llegaría al mock como texto. En el navegador real no pasa; aquí se usan
// las clases nativas de Node, compatibles con su fetch.
const FormDataNode = (
  await new Response('x=1', {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  }).formData()
).constructor
globalThis.FormData = FormDataNode
globalThis.File = FileNode
globalThis.Blob = BlobNode

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetearDb()
  document.cookie.split(';').forEach((cookie) => {
    const nombre = cookie.split('=')[0].trim()
    if (nombre) document.cookie = `${nombre}=; path=/; max-age=0`
  })
})
afterAll(() => server.close())
