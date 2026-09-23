# Desglose de Tareas — 003 · Implantación (MF0493_3)

**Basado en:** `plan.md` (misma carpeta), `001-entorno-cliente/`, `002-entorno-servidor/`
**Rama:** `feature/003-implantacion` — se abre desde `develop` tras mergear
`feature/002-entorno-servidor`.
**Convenciones:** S (≤4h) · M (0.5–2d) · L (>2d) · `[P]` paralelizable · Done verificable.

| ID | Descripción | Done | Est. | Deps | Archivos | Ref. |
|---|---|---|---|---|---|---|
| TI.1 | Apuntar el frontend a la API real (`VITE_API_BASE_URL`), desactivar MSW en modo integración | Las 9 HU ejecutadas manualmente de principio a fin contra cliente + servidor reales | M | `001`, `002` mergeados | `frontend/.env.integration`, `frontend/src/mocks/browser.js` | Paso 0 de `plan.md` |
| TI.2 | Registrar y corregir discrepancias cliente↔servidor encontradas en TI.1 | 0 discrepancias abiertas entre lo implementado y `spec.md` §12 | M | TI.1 | según discrepancia (cliente o servidor) | §12 |
| TI.3 [P] | Suite Playwright: HU-01 a HU-09 contra el sistema integrado | Cada HU con ≥1 test E2E en verde en CI | L | TI.2 | `e2e/tests/*.spec.ts` | HU-01..HU-09 |
| TI.4 [P] | axe-core integrado en Playwright (repite TC.15 pero contra el sistema íntegro) | 0 violaciones críticas/serias en CI | M | TI.2 | `e2e/tests/accesibilidad.spec.ts` | RNF-004 |
| TI.5 | Pruebas de rendimiento k6 sobre `GET /tareas`, `GET /modulos` | **No bloqueada por CA-09** (a diferencia de TI.13/TI.14: aquí sí se puede avanzar con un valor por defecto documentado). p95 < 2s con 50 VUs (valor por defecto de `plan.md` §5, sin confirmar); informe adjunto al PR indicando explícitamente que el umbral de VUs es provisional hasta que CA-09 se decida | M | TI.2 | `e2e/perf/*.js` | RNF-001, CA-09 |
| TI.6 | Hardening: cabeceras HTTP, revisión CORS (incluye `Access-Control-Allow-Credentials`), rate limiting Bucket4j y CSRF verificados end-to-end, OWASP Dependency-Check en CI | 0 vulnerabilidades altas/críticas sin mitigar; cabeceras verificadas con `curl -I`; `429` reproducido en `/auth/login` tras 6 intentos; mutación sin `X-CSRF-Token` → `403` contra el backend real | M | TI.2 | `SecurityConfig.java`, `.github/workflows/ci.yml` | RNF-002, RNF-003, RNF-011 |
| TI.7 | **CA-04 resuelta — verificación de integración, no bloqueada.** Confirmar que el flujo real cliente↔servidor de cookies (`refresh_token` `HttpOnly`, `csrf_token`) funciona igual que en el mock de `001-entorno-cliente` (TC.6, TC.7, TC.7b) contra el backend real de `002-entorno-servidor` (TS.8, TS.27–TS.31); recargar la página no pierde la sesión (renovación vía `/auth/refresh`); logout revoca el `jti` y una petición posterior con el access token antiguo devuelve `401` | Los 3 comportamientos anteriores verificados manualmente y con ≥1 test Playwright (TI.3) contra el sistema integrado | M | TI.1, TI.2 | `frontend/src/auth/AuthContext.jsx` (sin cambios de diseño, solo verificación), `e2e/tests/*.spec.ts` | RNF-002, CA-04 |
| TI.8 | Pulido de documentación OpenAPI (descripciones, ejemplos, agrupación por tag) | `/swagger-ui.html` navegable y completo en `dev`/`pre` | S | `002` mergeado | anotaciones `@Operation`/`@Schema` | RNF-009 |
| TI.9 | `docker-compose.prod.yml` + proxy inverso (Nginx/Traefik) con TLS | **No bloqueada por CA-08** (a diferencia de TI.13/TI.14): se despliega en el entorno de preproducción (`pre`), no en la infraestructura final de `prod` (que sigue pendiente de CA-08). Stack completo arranca en `pre`, con certificado TLS válido (emitido por una CA reconocida o Let's Encrypt, sin warnings de navegador) | M | TI.6 | `docker-compose.prod.yml`, config del proxy | RNF-008, CA-08 |
| TI.10 | Workflow `cd.yml`: build de imágenes + despliegue automático a `pre` en cada merge a `main` | Despliegue verificado en `pre` tras un merge de prueba | M | TI.9 | `.github/workflows/cd.yml` | — |
| TI.11 | Despliegue manual aprobado a `prod` + runbook de rollback | `docs/runbook-despliegue.md` con pasos probados al menos una vez | M | TI.10 | `docs/runbook-despliegue.md` | — |
| TI.12 | Backups automáticos de PostgreSQL en `prod` | Job programado de `pg_dump` verificado con una restauración de prueba | S | TI.9 | script de backup + cron/servicio | RNF-008 |
| TI.13 | **[Desbloqueada 2026-09-23: CA-01 resuelta, ver RNF-014]** Volumen persistente para adjuntos en el despliegue (incluido en copias de seguridad) | El volumen de adjuntos sobrevive a un redespliegue en `prod` (RNF-008) y se incluye en el procedimiento de copia de seguridad | — | CA-01 | backend + frontend, según decisión | RF-003, RF-012, CA-01 |
| TI.14 | **[BLOQUEADA por CA-05 — parcialmente resuelta]** El mecanismo técnico (cifrado de disco a nivel de infraestructura + anonimización real, TS.33) ya está decidido y se aplica en TI.9; lo que sigue bloqueado y pendiente aquí es exclusivamente confirmar la **base legal RGPD/LOPDGDD y el plazo de retención** antes de cargar datos reales de alumnado | No se despliega a `prod` con datos reales hasta que la parte legal de CA-05 esté resuelta (decisión del promotor, no técnica) | — | CA-05 (parte legal) | `docs/`, revisión legal | CA-05 |
| TI.15 | Revisión final de trazabilidad RF ↔ UC (tabla de `spec.md` §10) | Cada RF con ≥1 test automatizado que lo cubra, verificado contra la tabla | M | TI.3–TI.6, TI.16 | checklist, sin fichero nuevo | Todos los RF |
| TI.16 | Workflow `ci.yml`: crear/actualizar el pipeline de CI para que ejecute como *gate* de PR la suite Playwright (TI.3), axe-core (TI.4), k6 (TI.5) y OWASP Dependency-Check (TI.6), además de build+test+JaCoCo ya existentes de `002` | PR contra `develop`/`main` bloqueado si falla cualquiera de: tests E2E, accesibilidad, umbral de rendimiento (RNF-001/CA-09) o vulnerabilidades altas/críticas sin mitigar | M | TI.3, TI.4, TI.5, TI.6 | `.github/workflows/ci.yml` | RNF-001, RNF-004, RNF-007 |

## Cierre del módulo (y del proyecto v1.0)

- [ ] Suite E2E + accesibilidad + rendimiento en verde en CI (TI.16 cableado y en verde).
- [ ] `docker-compose.prod.yml` desplegado con éxito en el entorno de preproducción (`pre`).
- [ ] Runbook de despliegue/rollback probado.
- [ ] TI.7 verificada (ya no bloqueada — CA-04 resuelta); **TI.13 y TI.14 resueltas** antes de
      cualquier despliegue a `prod` con datos reales de alumnado — de lo contrario, el proyecto se
      mantiene desplegado en `pre` con datos ficticios hasta que se resuelvan.
