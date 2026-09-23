// Utilidades de cookies compartidas entre el código de aplicación (httpClient.js, que siempre
// corre en la página y por tanto tiene `document`) y los handlers de MSW.
//
// Nota sobre el mock (ver plan.md §6 de 001-entorno-cliente): en modo `npm run dev`, MSW
// intercepta a nivel de Service Worker (sin acceso a `document`) y depende de la cabecera
// `Set-Cookie` de la respuesta, que el navegador sí aplica para peticiones interceptadas. En
// `vitest` (entorno jsdom), `document` está disponible en el mismo proceso que los handlers, así
// que estos escriben también directamente en `document.cookie` como vía determinista para las
// pruebas. Por eso `leerCookieDocumento`/`escribirCookieDocumento` comprueban `typeof document`.

export function leerCookieDocumento(nombre) {
  if (typeof document === 'undefined') return null
  const encontrada = document.cookie
    .split('; ')
    .find((fila) => fila.startsWith(`${nombre}=`))
  return encontrada ? decodeURIComponent(encontrada.slice(nombre.length + 1)) : null
}

export function escribirCookieDocumento(nombre, valor, { maxAgeSegundos } = {}) {
  if (typeof document === 'undefined') return
  let cookie = `${nombre}=${encodeURIComponent(valor)}; path=/`
  if (typeof maxAgeSegundos === 'number') {
    cookie += `; max-age=${maxAgeSegundos}`
  }
  document.cookie = cookie
}

export function borrarCookieDocumento(nombre) {
  escribirCookieDocumento(nombre, '', { maxAgeSegundos: 0 })
}

export function leerCookieDeCabecera(cabeceraCookie, nombre) {
  if (!cabeceraCookie) return null
  const encontrada = cabeceraCookie
    .split(';')
    .map((fila) => fila.trim())
    .find((fila) => fila.startsWith(`${nombre}=`))
  return encontrada ? decodeURIComponent(encontrada.slice(nombre.length + 1)) : null
}
