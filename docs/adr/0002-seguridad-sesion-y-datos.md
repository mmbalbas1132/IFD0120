# ADR-0002 — Sesión (JWT en cookie + CSRF), replay, rate limiting y protección de datos

**Estado:** Aceptada
**Fecha:** 2026-09-22
**Decide:** Manuel María Balbás Naveira
**Afecta a:** `memory/constitution.md` (Principio 5, v2.0.0 → v2.1.0), `specs/000-funcional/spec.md`
§7 (RNF-002, RNF-003, RNF-011, RNF-012, RNF-013) y §13 (CA-03, CA-04, CA-05, CA-10),
`specs/001-entorno-cliente/plan.md`, `specs/002-entorno-servidor/plan.md`

## Contexto

Durante la revisión de la spec, se propuso una tabla de medidas de seguridad tomada de otro
contexto (examen cronometrado con antifraude, stack Prisma+Redis, actas firmadas digitalmente) que
no correspondía ni al dominio de GestorFP (tareas/entregas, no exámenes) ni a su stack (Java/Spring
Boot/PostgreSQL, no Node/Prisma). Se descartó explícitamente incorporar exámenes o actas oficiales
firmadas (fuera de alcance, `spec.md` §3.2). Sin embargo, varias de las *medidas de seguridad en sí*
— independientemente del dominio de examen del que venían — sí eran aplicables a GestorFP y
resolvían consideraciones abiertas ya identificadas (CA-03, CA-04, CA-05). Este ADR documenta cómo
se adaptaron al stack real.

## Decisiones

1. **Sesión — CA-04 resuelta.** El refresh token se entrega en una cookie `httpOnly` + `Secure` +
   `SameSite=Strict`, nunca en `localStorage`/`sessionStorage` (inaccesible a JavaScript, por tanto
   no robable por XSS). El access token JWT vive en memoria del cliente (una variable de React,
   perdida al recargar la página — el `AuthContext` lo renueva automáticamente contra
   `/auth/refresh` al arrancar). Expiración del access token: 15 min.
2. **CSRF — consecuencia de (1).** Al depender de una cookie para el refresh, se necesita
   protección CSRF explícita: esquema de doble token — una segunda cookie, no `httpOnly`, con un
   valor aleatorio que el cliente lee y reenvía como cabecera `X-CSRF-Token` en toda petición
   mutante (`POST`/`PUT`/`DELETE`). El servidor rechaza la petición si no coincide con el valor de
   la cookie.
3. **Replay de tokens.** Cada JWT lleva un claim `jti` (identificador único). Al hacer logout o
   revocar una sesión, ese `jti` se inserta en una tabla `tokens_revocados` de PostgreSQL con su
   `fecha_expiracion`; un filtro de Spring Security la consulta en cada petición autenticada. Sin
   Redis: se decidió explícitamente no añadir esa pieza de infraestructura (ver Alternativas).
4. **Fuerza bruta — CA-03 resuelta.** Bucket4j (librería Java, sin servicio externo) limita
   `/auth/login` por clave compuesta IP+usuario: `429` a partir de 5 intentos fallidos en 15 min.
5. **XSS.** React ya escapa por defecto; se añade la regla explícita de que cualquier uso futuro de
   `dangerouslySetInnerHTML` (por ejemplo, si un anuncio admite formato enriquecido) exige pasar el
   contenido por DOMPurify antes.
6. **Cifrado en reposo — CA-05 parcialmente resuelta.** Se descarta cifrado a nivel de columna
   (pgcrypto) por el coste de mantener un índice ciego para `UNIQUE(email)`; se opta por cifrado a
   nivel de infraestructura (disco/volumen cifrado del proveedor) + TLS en tránsito. La base legal
   RGPD/LOPDGDD concreta y el plazo de retención **siguen sin decidir** — es una decisión legal, no
   técnica, y queda registrada en `spec.md` CA-05 sin resolver.
7. **Anonimización real — parte de CA-05.** Se diseña (no se implementa todavía) un mecanismo
   invocable manualmente que sustituye `nombre`/`apellidos`/`email` por valores no identificables
   en la baja lógica de un `Usuario`, preservando `id` y `rol` por integridad referencial de
   calificaciones/entregas ya emitidas.
8. **ENS — nueva CA-10, explícitamente sin decidir.** Solo aplica si el despliegue real es para una
   Administración Pública; no se asume ni se descarta.

## Alternativas consideradas

| Alternativa | Por qué se descarta |
|---|---|
| JWT en `localStorage` (diseño original implícito) | Expuesto a robo de sesión completo ante cualquier XSS, sin mitigación adicional. |
| Redis para blacklist de `jti` y rate limiting | Añade una pieza de infraestructura nueva; se descarta explícitamente por decisión del promotor — PostgreSQL (tabla `tokens_revocados`) y Bucket4j cubren lo mismo sin ese coste operativo. |
| Cifrado de columna con pgcrypto + índice ciego | Técnicamente viable pero añade complejidad real a cada consulta por `email` (login, alta de usuario) a cambio de una protección que el cifrado de disco ya ofrece razonablemente para este caso de uso. |
| Exámenes cronometrados + actas firmadas digitalmente | Fuera del dominio y alcance de GestorFP (`spec.md` §3.2); las medidas de seguridad de esa tabla se adaptaron, pero el dominio en sí no se incorpora. |

## Consecuencias

- **Positivas:** superficie de exposición a robo de sesión significativamente menor que con
  `localStorage`; protección de fuerza bruta y replay sin infraestructura adicional; RGPD parcial
  resuelto sin sobrecoste técnico.
- **Negativas / deuda aceptada:** CSRF de doble token añade una pieza de plumbing más en cliente y
  servidor que un JWT puro en cabecera no necesitaría; la limpieza de `tokens_revocados` requiere
  un job periódico (no se limpia solo, a diferencia de un TTL nativo de Redis).
- **Pendiente:** la base legal RGPD/LOPDGDD concreta (CA-05) y la aplicabilidad del ENS (CA-10) no
  son decisiones técnicas — quedan explícitamente abiertas hasta que el promotor las resuelva.

## Enmienda de gobernanza asociada

Enmienda **MINOR** a la constitución (añade restricciones concretas al Principio 5 sin redefinirlo):
`memory/constitution.md` pasa de v2.0.0 a v2.1.0 en el mismo cambio que introduce este ADR.
