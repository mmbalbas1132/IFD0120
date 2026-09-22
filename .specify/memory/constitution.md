# Constitución del Proyecto — GestorFP

> Sistema de Gestión Académica de Ciclo Formativo, desarrollado como proyecto de referencia
> alineado con las competencias del Certificado de Profesionalidad **IFCD0210 — Desarrollo de
> aplicaciones con tecnologías web** (RD 1531/2011, modificado por RD 628/2013).

**Versión:** 3.0.0
**Ratificada:** 2026-09-22 · **Última enmienda:** 2026-09-22 (v2.1.0 → v3.0.0, ver [Historial de enmiendas](#historial-de-enmiendas))
**Ámbito de aplicación:** Todo el código, documentación y procesos de este repositorio.

Este documento define los principios **innegociables** que rigen el desarrollo de GestorFP.
Ninguna decisión técnica, de proceso o de producto puede contradecir estos principios sin pasar
antes por una enmienda formal de la constitución (ver [Gobernanza](#gobernanza)).

> **Nota de alcance (v3.0.0).** Esta constitución define **principios de gobernanza y estándares
> de calidad**, deliberadamente **agnósticos a la tecnología concreta** a partir de esta versión
> (ver Principio 3). Las decisiones de stack (lenguajes, frameworks, librerías, bases de datos,
> herramientas) para cada módulo viven en su propio `plan.md`, donde pueden evolucionar sin
> exigir una enmienda de este documento. Razonamiento completo en
> `docs/adr/0003-constitucion-agnostica-tecnologia.md`. **Excepción explícita:** el Principio 5
> (Seguridad por diseño) sigue nombrando mecanismos y tecnologías concretas (BCrypt, Bucket4j,
> PostgreSQL, DOMPurify...) — es una inconsistencia reconocida, no un descuido; se mantiene así
> deliberadamente en esta versión porque esos nombres son criterios de aceptación verificables de
> seguridad, no preferencias de stack, y separarlos de golpe habría revertido en silencio la
> ronda de seguridad recién cerrada (`docs/adr/0002-seguridad-sesion-y-datos.md`). Ver
> "Consecuencias" del ADR-0003 para el detalle de esta tensión y cuándo revisarla.

---

## Principio 1 — Especificación primero

**Ningún código de producción se escribe sin una especificación aprobada.**

- Toda funcionalidad nueva nace en `specs/000-funcional/spec.md` (historia de usuario + criterios
  de aceptación en Gherkin) — es la **única** fuente del "qué". Un cambio de alcance se hace ahí
  primero, nunca directamente en un `plan.md` de módulo.
- El "cómo" y el "cuándo" se reparten en tres specs de módulo, una por unidad de competencia del
  certificado, cada una con su propio `plan.md` + `tasks.md` y su propia rama de desarrollo
  (Principio 7 detalla la convención de ramas): `specs/001-entorno-cliente/`,
  `specs/002-entorno-servidor/`, `specs/003-implantacion/`.
- Un Pull Request que introduce comportamiento no cubierto por `specs/000-funcional/spec.md` se
  considera incompleto y no se aprueba.
- Los cambios de alcance durante el desarrollo se reflejan primero en la spec maestra, después en
  el plan y las tareas del módulo correspondiente, y solo entonces en el código (spec → plan →
  tasks → código, nunca al revés).
- Justificación: es el principio fundacional del flujo spec-driven (GitHub Spec Kit) y evita la
  deriva de alcance típica en proyectos formativos donde varias personas tocan el mismo código.

## Principio 2 — Separación cliente/servidor

**Arquitectura MVC obligatoria, con capas claramente diferenciadas.**

- El **entorno cliente** (React) y el **entorno servidor** (API REST Java/Spring Boot) son
  proyectos/módulos físicamente independientes (`frontend/` y `backend/`); el cliente solo se
  comunica con el servidor mediante la API REST documentada en `specs/000-funcional/spec.md` §12
  (nunca acceso directo a base de datos ni lógica de negocio duplicada en el cliente). Esta
  separación se mantiene aunque, por Principio 1, ambos módulos se desarrollen en ramas y momentos
  distintos: `001-entorno-cliente` construye contra una API simulada (mock) que respeta el mismo
  contrato que `002-entorno-servidor` implementa de verdad.
- En el servidor, el patrón **Modelo-Vista-Controlador** se traduce en tres capas explícitas:
  `Controller` (adaptador REST) → `Service` (lógica de negocio) → `Repository` (acceso a datos).
  Un controlador nunca accede directamente a un repositorio.
- Justificación: mapea directamente con UC0491_3 (cliente) y UC0492_3 (servidor) del certificado,
  y facilita que alumnado y colaboradores trabajen en una capa sin bloquear a quienes trabajan en
  la otra.

## Principio 3 — Selección razonable de stack tecnológico (enmendado v3.0.0)

**El stack concreto no se fija aquí. Se elige por módulo, se documenta en su `plan.md` y se
justifica contra los objetivos del certificado y del proyecto.**

> Este principio fue **redefinido** el 2026-09-22 (v2.1.0 → v3.0.0): deja de nombrar lenguajes,
> frameworks o librerías concretas y pasa a fijar los **criterios de decisión** que cualquier
> `plan.md` de módulo debe satisfacer. Las versiones v1.0.0/v2.0.0 de este principio nombraban
> React 18 + Tailwind/CSS3 en cliente y Java 17 + Spring Boot 3 en servidor; esas decisiones
> **siguen vigentes como stack real del proyecto** — no han cambiado — pero ahora se documentan y
> justifican en `specs/001-entorno-cliente/plan.md` y `specs/002-entorno-servidor/plan.md`
> respectivamente, no en este principio. `docs/adr/0001-frontend-react-tailwind.md` se conserva
> como ADR **histórico**, válido para entender por qué se eligió React/Tailwind, pero ya no es un
> mandato constitucional. Razonamiento completo del cambio de estructura en
> `docs/adr/0003-constitucion-agnostica-tecnologia.md`.

### Criterios de decisión (obligatorios en cada `plan.md`)

Toda propuesta de stack en un `plan.md` de módulo debe:

1. **Alinear con los objetivos del certificado IFCD0210.** El stack debe cubrir, de forma
   reconocible, las competencias de la unidad de competencia asociada al módulo (UC0491_3,
   UC0492_3 o UC0493_3). Cuando exista tensión entre "valor de portfolio profesional" y
   "trazabilidad literal con el certificado", la tensión **debe explicitarse** en el `plan.md`
   y resolverse con una justificación escrita, no con silencio (ver, p. ej., `spec.md` §11 sobre
   React vs. UC0491_3/UF1842).
2. **Priorizar ecosistemas maduros y con soporte a largo plazo (LTS).** Se prefieren tecnologías
   con mantenimiento activo, comunidad amplia, documentación oficial actualizada y versiones LTS
   cuando existan.
3. **Ser coherente con la separación cliente/servidor del Principio 2.** El stack no puede
   difuminar la frontera REST documentada en `spec.md` §12.
4. **No comprometer los umbrales de calidad** de los Principios 4 (WCAG 2.2 AA), 5 (seguridad)
   y 6 (cobertura de pruebas ≥ 70%). Si el stack elegido dificulta alguno de esos umbrales, el
   `plan.md` debe justificarlo y proponer la compensación concreta.
5. **Respetar la lógica de "CSS híbrido por convención técnica"** donde aplique: la coherencia
   de estilos se garantiza mediante reglas de build (por ejemplo, `content`/purge de Tailwind
   acotado por carpeta), no solo por disciplina de equipo. Ver
   `specs/001-entorno-cliente/plan.md` §5 para la convención vigente (Tailwind acotado a
   `src/features/admin/**`, CSS3 a mano en el resto).

### Obligaciones de proceso

- **Registro de decisión (ADR).** Toda elección de stack que afecte a más de un módulo, o que
  contradiga una elección previa, se documenta en `docs/adr/` con el formato estándar (contexto,
  decisión, consecuencias).
- **Justificación por dependencia.** Toda dependencia nueva (librería, starter, plugin) se
  justifica por escrito en el PR que la introduce.
- **Cambio de stack = cambio de plan, no de constitución.** Sustituir React por otro framework,
  Java por otro lenguaje, PostgreSQL por otra base de datos, etc., se tramita como un PR contra
  el `plan.md` del módulo correspondiente + un ADR. **No requiere enmienda de esta constitución**,
  siempre que los cinco criterios anteriores se sigan cumpliendo (ver Gobernanza).
- **Reversibilidad documentada.** El `plan.md` de cada módulo declara explícitamente qué parte
  del stack se considera "sustituible sin rediseño" y qué parte es "estructural".
- **Accesibilidad no negociable:** ninguna elección de stack reduce en ningún caso el umbral de
  Principio 4 (WCAG 2.2 AA); ver `spec.md` RNF-004.
- **Nota de evolución (2026-09-22):** cuando `feature/002-entorno-servidor` cierre con el
  Principio 5 ejercitado por pruebas reales (TS.27–TS.33 de `specs/002-entorno-servidor/tasks.md`),
  se evaluará extraer sus mecanismos concretos (BCrypt, Bucket4j, `tokens_revocados`, DOMPurify...)
  a un `docs/security-baseline.md`, simétrico a como el stack vive ya en los `plan.md`. Hasta
  entonces, la excepción declarada en la nota de alcance al inicio de este documento se mantiene.
  Este ítem tiene criterio de activación explícito — no es una intención sin fecha.

## Principio 4 — Accesibilidad y usabilidad (WCAG 2.2 AA) (enmendado v2.1.0)

**Cumplimiento obligatorio de las Pautas de Accesibilidad al Contenido Web (WCAG) 2.2 nivel AA y
WAI-ARIA.**

> El umbral se elevó de WCAG 2.1 AA a WCAG 2.2 AA el 2026-09-22 (v2.0.0 → v2.1.0), en la misma
> ronda de enmiendas que introdujo el Principio 5 actual, pero es una decisión independiente:
> WCAG 2.2 es un superconjunto estricto de 2.1 AA (añade criterios, no elimina ninguno), por lo
> que la subida no invalida trabajo ya hecho ni exige un ADR propio — no hay alternativas
> descartadas que documentar, a diferencia del Principio 5 (ver `docs/adr/0002-seguridad-sesion-y-datos.md`,
> que cubre solo la parte de sesión/CSRF/replay/rate limiting/datos personales de esa misma ronda).

- Toda vista nueva se valida con al menos una herramienta automática (axe-core / Lighthouse
  Accessibility) antes de mergear; una puntuación de Accesibilidad de Lighthouse < 90 bloquea el PR.
- Formularios: etiquetas asociadas (`<label for>`), mensajes de error programáticamente
  determinables, navegación completa por teclado, contraste mínimo 4.5:1.
- Contenido multimedia: alternativas textuales (`alt`, transcripciones o subtítulos cuando aplique).
- Justificación: es requisito explícito del certificado (UF1843) y de la normativa de
  contratación pública española (RD 1112/2018) a la que este tipo de aplicaciones suele estar
  sujeta.

## Principio 5 — Seguridad por diseño (enmendado v2.1.0)

**Validación en cliente y servidor; gestión de sesiones segura basada en cookie + protección CSRF;
protección activa frente a XSS, replay de tokens, fuerza bruta e inyección SQL; protección de
datos personales al nivel adecuado.**

> Este principio fue enmendado el 2026-09-22 (v2.0.0 → v2.1.0) para fijar mecanismos concretos de
> sesión, CSRF, replay, fuerza bruta y protección de datos que antes no estaban especificados. Es
> una enmienda **MINOR** (añade restricciones concretas, no redefine el principio). El contexto
> completo — incluida la comparación con alternativas descartadas (`localStorage`, Redis,
> pgcrypto) — está en `docs/adr/0002-seguridad-sesion-y-datos.md`; léase antes de tocar
> autenticación, autorización o el modelo de datos de `Usuario`.

- La validación en cliente (HTML5 + JS) es una mejora de experiencia, **nunca** la única barrera:
  toda entrada se revalida en el servidor con Bean Validation antes de tocar la capa de negocio.
- Acceso a datos exclusivamente mediante Spring Data JPA / consultas parametrizadas; prohibida la
  concatenación de SQL con entrada de usuario.
- **Sesión (JWT en cookie, no en `localStorage`):** el *refresh token* se entrega en una cookie
  `httpOnly` + `Secure` + `SameSite=Strict`, inaccesible a JavaScript y por tanto no robable por
  XSS. El *access token* JWT (firmado HS256/RS256, expiración ≤ 15 min) vive únicamente en memoria
  del cliente (nunca en `localStorage`/`sessionStorage`); el cliente lo renueva contra
  `/auth/refresh` al arrancar la aplicación. Contraseñas con BCrypt (coste ≥ 10).
- **CSRF:** esquema de doble token — una segunda cookie no-`httpOnly` con un valor aleatorio que el
  cliente reenvía como cabecera `X-CSRF-Token` en toda petición mutante (`POST`/`PUT`/`DELETE`); el
  servidor rechaza la petición si no coincide con el valor de la cookie.
- **Replay de tokens:** cada JWT lleva un claim `jti` único. Al hacer logout o revocar una sesión,
  ese `jti` se inserta en la tabla `tokens_revocados` de PostgreSQL con su fecha de expiración; un
  filtro de Spring Security la consulta en cada petición autenticada. Se descarta explícitamente
  Redis para esta pieza (ver alternativas en ADR-0002): no se añade infraestructura nueva solo para
  una blacklist que PostgreSQL cubre igual de bien a esta escala.
- **Fuerza bruta:** Bucket4j (librería embebida, sin servicio externo) limita `/auth/login` por
  clave compuesta IP+usuario — `429` a partir de 5 intentos fallidos en 15 min. Sin Redis.
- **Autorización:** por roles (RBAC) verificada en cada endpoint con `@PreAuthorize`, nunca solo
  ocultando elementos en el cliente; además, verificación explícita de **propiedad del recurso**
  en la capa `service` (p. ej. un alumno solo accede a sus propias entregas) — un rol correcto no
  basta si el recurso no es del usuario autenticado. Todo endpoint sensible lleva una prueba que
  verifique el `403` cuando la propiedad no se cumple.
- **XSS:** React escapa por defecto; cualquier uso de `dangerouslySetInnerHTML` (p. ej. si un
  anuncio admite formato enriquecido) exige pasar el contenido por DOMPurify antes de renderizarlo.
- Cabeceras de seguridad (CSP, `X-Content-Type-Options`, `X-Frame-Options`) activas en todos los
  entornos; CORS restringido a los orígenes del cliente autorizado.
- **Protección de datos personales (RGPD/LOPDGDD):** cifrado en reposo a **nivel de
  infraestructura** (disco/volumen cifrado del proveedor), no cifrado de columna (se descarta
  pgcrypto explícitamente — ver alternativas en ADR-0002); TLS en tránsito en todos los entornos.
  La baja lógica de un `Usuario` dispone de un mecanismo de anonimización real (sustituye
  nombre/apellidos/email por valores no identificables, conserva `id`/`rol` por integridad
  referencial). La base legal RGPD/LOPDGDD concreta y el plazo de retención son una decisión legal
  pendiente, no técnica (`spec.md` CA-05) — este principio fija el mecanismo técnico, no sustituye
  esa decisión.
- La aplicabilidad del Esquema Nacional de Seguridad (ENS) queda explícitamente sin decidir
  (`spec.md` CA-10): solo aplicaría si el despliegue real fuese para una Administración Pública; no
  se asume ni se descarta a nivel de este principio.
- Ningún secreto (claves, credenciales de BD, JWT secret) se versiona en el repositorio; se
  gestionan mediante variables de entorno o un gestor de secretos.
- Justificación: mapea con UC0492_3/CR y UC0493_3 (RP1, seguridad en la implantación) y es
  condición de aceptación no negociable para cualquier aplicación con datos de menores (alumnado).

## Principio 6 — Pruebas automatizadas

**Cobertura mínima del 70% en lógica de negocio (capa `service`).**

- Backend: JUnit 5 + Mockito para pruebas unitarias de servicios; pruebas de integración con
  Testcontainers (PostgreSQL real) para repositorios y controladores (`@SpringBootTest` +
  `MockMvc`/`WebTestClient`).
- Frontend: pruebas E2E de los flujos críticos (login, entrega de tarea, calificación) con
  Playwright o Cypress.
- La cobertura se mide con JaCoCo en cada build de CI; un descenso por debajo del 70% en `service`
  bloquea el merge a `main`.
- Ninguna corrección de bug se cierra sin una prueba que reproduzca el fallo original.
- Justificación: requisito explícito del prompt fundacional y de UC0493_3/RP3 (verificación y
  pruebas de software).

## Principio 7 — Documentación viva

**Control de versiones con Git y documentación generada automáticamente, no redactada a mano y
desactualizable.**

- Historial Git siguiendo **Conventional Commits**; estrategia de ramas `main` (protegida) +
  `develop` + una rama de feature **por módulo del certificado**, desarrolladas y mergeadas
  **secuencialmente, no en paralelo**, en el mismo orden en que el certificado las enseña:
  1. `feature/001-entorno-cliente` (MF0491_3) → PR contra `develop`
  2. `feature/002-entorno-servidor` (MF0492_3) → PR contra `develop`, solo tras mergear la 1
  3. `feature/003-implantacion` (MF0493_3) → PR contra `develop`, solo tras mergear la 2
  Cada rama referencia su spec de módulo (`specs/00N-<slug>/`); ninguna introduce cambios en el
  "qué" de `specs/000-funcional/spec.md` sin pasar antes por Principio 1.
- API documentada con **OpenAPI/Swagger** generado desde el propio código (springdoc-openapi);
  nunca una colección de Postman mantenida a mano como única fuente de verdad.
- Javadoc obligatorio en clases e interfaces públicas del paquete `service` y `controller`.
- Todo ADR (decisión de arquitectura relevante) se registra en `docs/adr/` con el formato
  estándar (contexto, decisión, consecuencias).
- Justificación: mapea con UC0493_3/RP2 y garantiza que la documentación sobreviva a la rotación
  de alumnado/colaboradores típica de un proyecto docente.

---

## Restricciones técnicas transversales

Aplican a todos los principios anteriores y son criterios de aceptación de cualquier PR:

| Restricción | Umbral / criterio |
|---|---|
| Compatibilidad de navegadores | Últimas 2 versiones de Chrome, Firefox, Edge y Safari (desktop y móvil) |
| Tiempo de respuesta | p95 < 2 s para cualquier endpoint de la API bajo carga nominal (ver `plan.md`) |
| Diseño responsive | Mobile-first; breakpoints mínimos en 480px / 768px / 1024px |
| Modularidad | Ningún fichero de controlador/servicio supera ~300 líneas sin justificación en PR |
| Idempotencia de despliegue | El proceso de despliegue es repetible y reversible (ver `plan.md` §Despliegue) |

## Gobernanza

- Esta constitución **prevalece** sobre cualquier preferencia individual de estilo o herramienta.
- **Enmiendas:** cualquier cambio a este documento requiere un Pull Request específico
  (`constitution: <resumen del cambio>`), aprobado explícitamente antes de mergear, con la
  versión incrementada según semver (MAJOR: elimina o redefine un principio; MINOR: añade un
  principio o restricción; PATCH: aclaración de redacción sin cambio de fondo).
- **Cambios de stack NO son enmiendas (desde v3.0.0).** Modificar el lenguaje, framework,
  librería o base de datos de un módulo se tramita como PR contra el `plan.md` de ese módulo + un
  ADR en `docs/adr/`, siempre que se sigan cumpliendo los cinco criterios de decisión del
  Principio 3. Solo sería enmienda MAJOR si el cambio implicara **abandonar** algún principio
  (por ejemplo, renunciar a la separación cliente/servidor del Principio 2).
- Claude Code y cualquier otro agente de desarrollo asistido **no puede** saltarse un principio
  para "ir más rápido"; si un principio bloquea una tarea, la tarea se replantea o se propone una
  enmienda — nunca se ignora en silencio.
- Toda spec (`spec.md`), plan (`plan.md`) o conjunto de tareas (`tasks.md`) que entre en
  conflicto con esta constitución debe corregirse antes de continuar; ver `CLAUDE.md` para el
  procedimiento operativo.

---

## Historial de enmiendas

| Versión | Fecha | Cambio | Tipo |
|---|---|---|---|
| 1.0.0 | 2026-09-22 | Ratificación inicial (7 principios) | — |
| 2.0.0 | 2026-09-22 | Principio 3 redefinido: React 18 en todo el cliente (antes prohibido sin enmienda); Tailwind CSS acotado a `src/features/admin/**`, CSS3 a mano en el resto. Principio 1 y 7 actualizados a la estructura de 3 specs de módulo + rama secuencial por módulo. Ver `docs/adr/0001-frontend-react-tailwind.md`. | MAJOR (redefine un principio) |
| 2.1.0 | 2026-09-22 | Principio 5 ampliado con mecanismos concretos: sesión JWT en cookie `httpOnly`+CSRF de doble token, blacklist de `jti` en PostgreSQL (sin Redis), rate limiting con Bucket4j (sin Redis), cifrado en reposo a nivel de infraestructura (sin pgcrypto), anonimización real en baja lógica de `Usuario`. Principio 4 elevado de WCAG 2.1 AA a WCAG 2.2 AA. Ver `docs/adr/0002-seguridad-sesion-y-datos.md`. | MINOR (añade restricciones concretas, no redefine los principios) |
| 3.0.0 | 2026-09-22 | Principio 3 reescrito como principio **agnóstico a la tecnología**: elimina los nombres de lenguajes, frameworks, librerías y bases de datos; introduce cinco criterios de decisión obligatorios para los `plan.md` de módulo y traslada la justificación del stack al `plan.md` + ADR de cada módulo. El stack nombrado hasta v2.1.0 (React 18/Tailwind en cliente, Java 17/Spring Boot 3 en servidor) no cambia — solo cambia dónde se documenta. Principios 4 y 5 no se tocan (se mantienen íntegros de v2.1.0, incluida la excepción reconocida de que el Principio 5 sigue nombrando tecnología de seguridad concreta — ver nota de alcance al inicio del documento). Ver `docs/adr/0003-constitucion-agnostica-tecnologia.md`. | MAJOR (redefine un principio) |

---

*Próxima revisión programada: al cierre de `feature/001-entorno-cliente` (ver
`specs/001-entorno-cliente/plan.md`).*
