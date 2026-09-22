# Desglose de Tareas — 002 · Entorno Servidor (MF0492_3)

**Basado en:** `plan.md` (misma carpeta) y `specs/000-funcional/spec.md` (RF/modelo/contrato §12)
**Rama:** `feature/002-entorno-servidor` — se abre desde `develop` tras mergear
`feature/001-entorno-cliente`.
**Convenciones:** S (≤4h) · M (0.5–2d) · L (>2d) · `[P]` paralelizable · Done verificable.

| ID | Descripción | Done | Est. | Deps | Archivos | RF |
|---|---|---|---|---|---|---|
| TS.1 | Inicializar Spring Boot (Web, Data JPA, Security, Validation, springdoc) | `mvn spring-boot:run` levanta `/actuator/health` en 200 | S | — | `backend/pom.xml`, `GestorFpApplication.java` | — |
| TS.2 [P] | `docker-compose.yml` (backend + PostgreSQL) para `dev` | `docker compose up` levanta ambos servicios | S | TS.1 | `docker-compose.yml`, `backend/Dockerfile` | — |
| TS.3 | Migración `V1__init_schema.sql` con todas las tablas de `plan.md` §5 | `flyway:migrate` aplica sin error; tablas e índices verificados | M | TS.1, TS.2 | `db/migration/V1__init_schema.sql` | RF-008, RF-009, RF-010 |
| TS.4 [P] | Entidades JPA: `Usuario`, `Modulo`, `UnidadFormativa`, `Matricula` | Mapean 1:1 con el esquema; contexto Spring carga sin error | M | TS.3 | `domain/*.java` | RF-008, RF-009, RF-010 |
| TS.5 [P] | Entidades JPA: `Tarea`, `Entrega`, `Evaluacion`, `Recurso`, `Anuncio` | Ídem TS.4 | M | TS.3 | `domain/*.java` | RF-001, RF-003, RF-005, RF-012, RF-013 |
| TS.6 | Repositorios Spring Data JPA para las 9 entidades | Cada repositorio con ≥1 método derivado probado (`@DataJpaTest`) | M | TS.4, TS.5 | `repository/*.java` | — |
| TS.7 | `JwtService` + `SecurityConfig` (filtro JWT, reglas por ruta según §12; access token en cabecera/cuerpo, refresh token en cookie `HttpOnly`) | Login válido → JWT decodificable; ruta protegida sin token → 401 | L | TS.4 | `security/*.java`, `config/SecurityConfig.java` | RF-014 |
| TS.8 | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` (exactos a §12; cookies `refresh_token` `HttpOnly`+`Secure`+`SameSite=Strict` y `csrf_token` no-`HttpOnly`, ver `plan.md` §6) | Casos de éxito y error (401) cubiertos con MockMvc; cookies presentes y con atributos correctos en la respuesta | M | TS.7 | `controller/AuthController.java` | RF-014 |
| TS.9 [P] | CRUD `Usuario` con baja lógica (endpoints de §12) | RF-008 probado; email duplicado → 409 | M | TS.6, TS.8 | `{service,controller,dto}/Usuario*.java` | RF-008 |
| TS.10 [P] | CRUD `Modulo` + `UnidadFormativa` | RF-009 probado; código duplicado → 409 | M | TS.6, TS.8 | `{service,controller,dto}/Modulo*.java`, `UnidadFormativa*.java` | RF-009 |
| TS.11 | CRUD `Matricula` con restricción de unicidad alumno+módulo activa | RF-010; doble matrícula → 409 | M | TS.9, TS.10 | `{service,controller,dto}/Matricula*.java` | RF-010 |
| TS.12 | `GET /modulos/publicos` (sin auth, sin datos personales) | RF-011: 200 sin token; sin campos de alumnado en la respuesta | S | TS.10 | `controller/ModuloPublicoController.java` | RF-011 |
| TS.13 | Seed de datos (`V2__seed_roles_demo.sql`), solo perfil `dev` | `docker compose up` en dev deja usuarios/módulos de ejemplo | S | TS.3 | `db/migration/V2__seed_roles_demo.sql` | — |
| TS.14 | Validador `@FechaFutura` | Aplicado a `fechaLimite`; prueba unitaria aislada | S | TS.5 | `validation/FechaFuturaValidator.java` | RF-002 |
| TS.15 | Servicio + controlador `Tarea` | RF-001/002; fecha límite pasada → 400 | M | TS.10, TS.14 | `{service,controller,dto}/Tarea*.java` | RF-001, RF-002 |
| TS.16 | Servicio + controlador `Entrega` con cálculo de fuera de plazo | RF-003/004; entrega tras `fechaLimite` → `ENTREGADA_FUERA_DE_PLAZO` | M | TS.15 | `{service,controller,dto}/Entrega*.java` | RF-003, RF-004 |
| TS.17 | Validador `@RangoCalificacion` (0–10) | Prueba unitaria con límites 0, 10, -0.1, 10.1 | S | TS.5 | `validation/RangoCalificacionValidator.java` | RF-006 |
| TS.18 | Servicio + controlador `Evaluacion` con comprobación de propiedad (docente del módulo) | RF-005/006; docente ajeno → 403; nota fuera de rango → 422 | M | TS.16, TS.17 | `{service,controller,dto}/Evaluacion*.java` | RF-005, RF-006 |
| TS.19 | `GET /alumnos/{id}/calificaciones` con filtro de propiedad | RF-007: alumno solo ve las suyas (403 si otro id); docente ve las de su módulo | M | TS.18 | `controller/CalificacionController.java` | RF-007 |
| TS.20 [P] | Servicio + controlador `Recurso` | RF-012; tipos DOCUMENTO/VIDEO/ENLACE probados | M | TS.10 | `{service,controller,dto}/Recurso*.java` | RF-012 |
| TS.21 [P] | Servicio + controlador `Anuncio` (orden por destacado) | RF-013; orden de listado probado | M | TS.10 | `{service,controller,dto}/Anuncio*.java` | RF-013 |
| TS.22 | `GlobalExceptionHandler` unificando el contrato de error de §12 | Toda excepción mapeada a 400/403/404/409/422; prueba por código | M | TS.15–TS.21 | `exception/GlobalExceptionHandler.java` | Contrato §12 |
| TS.23 | Auditoría mínima (`fechaCreacion`/`fechaModificacion`) vía `@EntityListeners` | RF-015 verificado en ≥2 entidades | S | TS.4, TS.5 | `domain/Auditable.java` | RF-015 |
| TS.24 | Cobertura JaCoCo `service` ≥ 70% como *gate* de CI | Reporte JaCoCo en CI con umbral bloqueante | M | TS.14–TS.23 | `pom.xml` (plugin JaCoCo) | RNF-007 |
| TS.25 | Verificación de conformidad OpenAPI generado vs. `spec.md` §12 (`plan.md` §7) | 0 discrepancias sin justificar, documentadas si las hay | M | TS.8–TS.23 | comparación manual, sin fichero nuevo | Contrato §12 |
| TS.26 | **[BLOQUEADA por CA-01 de spec.md §13]** Mecanismo real de subida/almacenamiento de ficheros para `ficheroUrl` | No se implementa hasta que CA-01 esté decidida; hasta entonces `ficheroUrl` acepta una URL de texto libre sin validar | — | CA-01 | `{service}/Entrega*.java`, `{service}/Recurso*.java` | RF-003, RF-012 |
| TS.27 | Migración `V3__tokens_revocados.sql` + entidad/repositorio `TokenRevocado` (`jti`, `fecha_expiracion`) | `flyway:migrate` aplica sin error; repositorio probado con `@DataJpaTest` | S | TS.3 | `db/migration/V3__tokens_revocados.sql`, `domain/TokenRevocado.java`, `repository/TokenRevocadoRepository.java` | RNF-002 |
| TS.28 | Filtro de replay: tras validar firma/expiración del JWT, rechaza (`401`) si su `jti` está en `tokens_revocados`; `POST /auth/logout` inserta el `jti` vigente | Prueba: token revocado tras logout → `401` en petición posterior con el mismo access token | M | TS.7, TS.27 | `security/JtiBlacklistFilter.java`, `controller/AuthController.java` | RNF-002 |
| TS.29 | Job periódico (`@Scheduled`) de limpieza de `tokens_revocados` con `fecha_expiracion` pasada | Prueba de servicio: filas expiradas se eliminan, filas vigentes no | S | TS.27 | `service/LimpiezaTokensRevocadosJob.java` | RNF-002 |
| TS.30 | Rate limiter Bucket4j en `POST /auth/login` (clave IP+usuario, 5 intentos/15 min → `429`) | Prueba: 6º intento fallido en la ventana → `429`; intento tras la ventana → `200`/`401` normal | M | TS.8 | `security/LoginRateLimiterFilter.java` | RNF-011 |
| TS.31 | Filtro CSRF de doble token: exige `X-CSRF-Token` = cookie `csrf_token` en `POST`/`PUT`/`DELETE` autenticados por cookie | Prueba: mutación sin cabecera o con valor distinto → `403`; con valor correcto → pasa | M | TS.8 | `security/CsrfDobleTokenFilter.java` | RNF-003 |
| TS.32 | Prueba de propiedad de recurso (`403`) por cada endpoint sensible (Entrega, Evaluacion, Calificación) | Matriz de pruebas: usuario autenticado con rol correcto pero recurso ajeno → `403` en cada endpoint listado | M | TS.16, TS.18, TS.19 | `controller/*Test.java` | RNF-012 |
| TS.33 | Mecanismo de anonimización en baja lógica de `Usuario` (sustituye nombre/apellidos/email, conserva id/rol) invocable manualmente desde `service` | Prueba: tras invocar, `nombre`/`apellidos`/`email` no identificables; `id`/`rol` intactos; entregas/evaluaciones ya emitidas siguen íntegras (FK) | M | TS.9 | `service/AnonimizacionUsuarioService.java` | RNF-013 |

## Cierre del módulo

Antes de abrir el PR de `feature/002-entorno-servidor` → `develop`:

- [ ] Los 23 endpoints de §12 implementados y probados (éxito + error).
- [ ] Cobertura `service` ≥ 70% en CI.
- [ ] `/swagger-ui.html` navegable en `dev`.
- [ ] TS.26 permanece explícitamente bloqueada y documentada, no omitida en silencio.
- [ ] TS.27–TS.33 (seguridad: replay, rate limiting, CSRF, propiedad de recurso, anonimización) implementadas y probadas — Constitución Principio 5 v2.1.0 / ADR-0002.
