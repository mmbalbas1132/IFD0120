import { httpClient } from './httpClient.js'

export function login(email, password) {
  return httpClient('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function refrescarSesion() {
  return httpClient('/auth/refresh', { method: 'POST' })
}

export function logout() {
  return httpClient('/auth/logout', { method: 'POST' })
}
