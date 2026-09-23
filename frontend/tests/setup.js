import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect' // TC.15: expect(...).toHaveNoViolations()
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../src/mocks/server.js'
import { resetearDb } from '../src/mocks/db.js'

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
