// "JWT" simulado para el mock: NO es un JWT firmado de verdad (no hay verificación
// criptográfica — ver plan.md §1 "No construye: autenticación real"), solo un payload
// codificado en base64 con la forma mínima que AuthContext.jsx y los handlers necesitan
// para simular expiración (RNF-002: access token ≤ 15 min) y revocación por `jti`.
function base64UrlCodificar(objeto) {
  const json = JSON.stringify(objeto)
  return btoa(unescape(encodeURIComponent(json)))
}

function base64UrlDecodificar(cadena) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(cadena))))
  } catch {
    return null
  }
}

let contadorJti = 1

export function crearAccessTokenSimulado({ userId, rol }) {
  const ahora = Date.now()
  const payload = {
    sub: userId,
    rol,
    jti: `jti-${contadorJti++}-${ahora}`,
    iat: ahora,
    // RNF-002: expiración ≤ 15 min. En el mock usamos 15 min exactos.
    exp: ahora + 15 * 60 * 1000,
  }
  return `mock.${base64UrlCodificar(payload)}.sig`
}

export function decodificarAccessTokenSimulado(token) {
  if (!token || typeof token !== 'string') return null
  const partes = token.split('.')
  if (partes.length !== 3) return null
  return base64UrlDecodificar(partes[1])
}

export function tokenExpirado(payload) {
  if (!payload?.exp) return true
  return Date.now() > payload.exp
}
