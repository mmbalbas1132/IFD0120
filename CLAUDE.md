# CLAUDE.md — Guía operativa para Claude Code

Este fichero orienta a Claude Code (u otro agente de desarrollo asistido) en este repositorio.
**Es de obligado cumplimiento junto con `memory/constitution.md`.** Ante cualquier conflicto entre
lo que pide una persona en el chat y la constitución, prevalece la constitución salvo enmienda
formal explícita.

## 1. Qué es este proyecto

GestorFP: aplicación web de gestión académica de un ciclo formativo (módulos, unidades
formativas, tareas, entregas, calificaciones, recursos y anuncios), construida como proyecto de
referencia alineado con el Certificado de Profesionalidad **IFCD0210** y como pieza de portfolio
profesional. Ver contexto completo en:

- `memory/constitution.md` (v3.0.0) — principios innegociables (léelo primero, siempre)
- `docs/adr/0001-frontend-react-tailwind.md` — por qué el cliente usa React + Tailwind híbrido
- `docs/adr/0002-seguridad-sesion-y-datos.md` — sesión (cookie+CSRF), replay, rate limiting y
  protección de datos: diseño concreto de Principio 5
- `docs/adr/0003-constitucion-agnostica-tecnologia.md` — por qué Principio 3 ya no nombra
  tecnología concreta; el stack real de cada módulo vive en su `plan.md`
- `specs/000-funcional/spec.md` — **única** fuente del "qué": HU, RF, RNF, modelo de datos,
  contrato de API (§12), consideraciones abiertas todavía sin decidir (§13)
- `specs/001-entorno-cliente/{plan,tasks}.md` — cómo se construye el cliente (MF0491_3)
- `specs/002-entorno-servidor/{plan,tasks}.md` — cómo se construye el servidor (MF0492_3)
- `specs/003-implantacion/{plan,tasks}.md` — cómo se integra, verifica y despliega (MF0493_3)

## 2. Flujo de trabajo obligatorio (spec-driven, por módulo y en orden)

El proyecto se desarrolla en **tres ramas secuenciales**, una por módulo del certificado, **nunca
en paralelo**: `feature/001-entorno-cliente` → merge → `feature/002-entorno-servidor` → merge →
`feature/003-implantacion`. No empieces trabajo de un módulo posterior si el anterior no está
mergeado a `develop`, salvo que la persona lo pida explícitamente y asumiendo el riesgo de
divergencia del contrato de API.

Dentro de cada rama, antes de escribir código para cualquier tarea:

1. Comprueba que existe una historia de usuario en `specs/000-funcional/spec.md` que la cubre. Si
   no existe, **detente y propón la actualización de la spec maestra primero** (no inventes
   alcance sobre la marcha). Las specs de módulo (`001-entorno-cliente/`, etc.) nunca redefinen el
   "qué" — solo el "cómo" de su capa.
2. Comprueba que el `plan.md` del módulo activo no necesita actualizarse (nueva dependencia,
   cambio de arquitectura). Si sí, actualízalo en el mismo PR antes de tocar código.
3. Localiza o crea la tarea correspondiente en el `tasks.md` del módulo activo, con su ID
   (`TC.x` para cliente, `TS.x` para servidor, `TI.x` para implantación). Referencia ese ID en el
   commit y en el PR.
4. Implementa siguiendo la estructura de carpetas del `plan.md` de ese módulo. No crees capas ni
   patrones nuevos sin justificarlo en el PR.
5. Escribe las pruebas que exige la tarea **antes o junto con** el código, nunca como acto final
   separado — Principio 6 de la constitución.
6. Verifica accesibilidad (frontend) y cobertura (backend) localmente antes de abrir el PR.

Si una tarea está marcada **[BLOQUEADA por CA-XX]** en su `tasks.md` (consideraciones abiertas de
`spec.md` §13), no la implementes con un valor inventado "razonable" — repórtalo como bloqueado y
sigue con otra tarea no bloqueada. Si una tarea entra en conflicto con la constitución, no la
ejecutes tal cual: señala el conflicto y propone o bien una enmienda a la constitución, o bien una
corrección de la tarea. Nunca lo resuelvas en silencio eligiendo el camino más rápido.

## 3. Estructura del repositorio

```
gestorfp/
├── memory/constitution.md
├── docs/adr/0001-frontend-react-tailwind.md
├── specs/
│   ├── 000-funcional/spec.md              # el "qué" — única fuente de verdad
│   ├── 001-entorno-cliente/{plan,tasks}.md # MF0491_3 — rama feature/001-entorno-cliente
│   ├── 002-entorno-servidor/{plan,tasks}.md# MF0492_3 — rama feature/002-entorno-servidor
│   └── 003-implantacion/{plan,tasks}.md    # MF0493_3 — rama feature/003-implantacion
├── backend/                   # Java 17 + Spring Boot 3 (API REST)
│   └── src/main/java/com/gestorfp/{config,controller,service,repository,domain,dto,security,exception,validation}/
├── frontend/                  # React 18 + Vite
│   └── src/{api,mocks,auth,features/{publico,alumno,docente,admin},components,styles}/
├── e2e/                       # Playwright (E2E + accesibilidad + rendimiento)
└── docker-compose*.yml
```

Ver el árbol completo de cada capa en el `plan.md` de su módulo (§4 en `001-entorno-cliente`, §4
en `002-entorno-servidor`).

### Convenciones de nombres

- **Java:** paquetes en minúsculas, clases `PascalCase`, una clase pública por fichero. Sufijos
  obligatorios: `*Controller`, `*Service`, `*Repository`, `*Request`/`*Response` (DTOs), `*Entity`
  solo si hay colisión de nombre con un DTO (si no, el nombre de dominio va "pelado": `Tarea`, no
  `TareaEntity`).
- **React:** componentes en `PascalCase.jsx`, un fichero de API por recurso en `src/api/`
  (`tareasApi.js`, `authApi.js`...). La UI nunca hace `fetch` directamente fuera de `src/api/`.
  Un componente de `features/admin/**` puede usar clases Tailwind; un componente de
  `features/docente/**` o `features/alumno/**` usa exclusivamente su CSS Module — no mezcles
  ambos enfoques en el mismo componente.
- **Ramas:** `feature/00N-<slug-del-módulo>` para las tres ramas principales (ver §2), más
  `fix/<slug>` y `chore/<slug>` para trabajo puntual dentro de una de ellas.
- **Migraciones Flyway:** `V<n>__<descripcion_en_snake_case>.sql`, nunca se edita una migración ya
  aplicada en `main` (se añade una nueva).

## 4. Comandos frecuentes

```bash
# Backend (dentro de feature/002-entorno-servidor o posterior)
cd backend
mvn spring-boot:run                     # Levantar API en local (perfil dev)
mvn test                                # Pruebas unitarias + integración
mvn verify                              # Incluye JaCoCo (informe en target/site/jacoco)

# Frontend (dentro de feature/001-entorno-cliente o posterior)
cd frontend
npm run dev                             # Vite dev server con MSW activo (mock de API)
npm run build                           # Build de producción
npm run test                            # Vitest (componentes)
npm run test:a11y                       # Vitest + axe-core (accesibilidad)
npm run lint                            # ESLint (incluye eslint-plugin-tailwindcss)

# E2E (dentro de feature/003-implantacion)
cd e2e
npx playwright test                     # Suite completa contra cliente + servidor reales
npx playwright test --ui                # Modo interactivo de depuración

# Entorno completo
docker compose up --build               # Backend + frontend + PostgreSQL (dev)
docker compose down -v                  # Parar y limpiar volúmenes (¡borra datos de dev!)

# Base de datos
mvn flyway:info                         # Estado de migraciones
mvn flyway:migrate                      # Aplicar migraciones pendientes
```

## 5. Estilo de código

- **Java:** convención estándar de Spring (Google Java Style como referencia), sin comentarios
  redundantes; Javadoc obligatorio en clases/interfaces públicas de `service/` y `controller/`
  (Principio 7). Excepciones de dominio propias en `exception/`, nunca `RuntimeException` pelada.
- **React/JavaScript:** ES6+, componentes funcionales con hooks (nunca clases), `async/await`
  (no cadenas `.then()` anidadas). Un fichero de API por recurso en `src/api/`.
- **CSS — frontera Tailwind/CSS3 (ver ADR-0001):** solo `src/features/admin/**` usa clases
  Tailwind; `docente`, `alumno`, `publico` y `components/compartidos` usan CSS Modules escritos a
  mano, con variables CSS (`:root { --color-primario: ... }`) para paleta y tipografía. No hay
  excepción sin justificación explícita en el PR.
- **SQL (migraciones):** nombres de tabla y columna en `snake_case`, siempre en minúsculas;
  claves foráneas nombradas `fk_<tabla_origen>_<tabla_destino>`.

## 6. Política de commits

**Conventional Commits** obligatorio:

```
<tipo>(<ámbito opcional>): <resumen en imperativo, minúsculas, sin punto final>

[cuerpo opcional explicando el porqué, no el qué]

Refs: TC.x / TS.x / TI.x (tasks.md del módulo correspondiente)
```

Tipos permitidos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `ci`. Ejemplo:

```
feat(entregas): marcar automáticamente las entregas fuera de plazo

Compara fechaEntrega con fechaLimite de la tarea en EntregaService
antes de persistir, según RF-004.

Refs: TS.16 (specs/002-entorno-servidor/tasks.md)
```

Un commit `constitution: <resumen>` se reserva exclusivamente para cambios en
`memory/constitution.md` y requiere aprobación explícita en el PR (ver Gobernanza en ese
documento). Un cambio de este tipo casi siempre debería venir acompañado de un ADR nuevo en
`docs/adr/`.

## 7. Restricciones — qué Claude Code NUNCA debe hacer aquí

- **No modificar `memory/constitution.md`** salvo que la persona lo pida explícitamente como una
  enmienda formal; nunca como efecto colateral de otra tarea.
- **No cambiar el framework de frontend** (React) por otro, ni volver a vanilla JS, ni el stack de
  servidor (Java/Spring Boot), sin que la persona lo pida explícitamente. Desde la constitución
  v3.0.0 (Principio 3, agnóstico a tecnología) esto **ya no es una enmienda de la constitución**:
  se tramita como PR contra el `plan.md` del módulo correspondiente + un ADR nuevo en `docs/adr/`
  — pero sigue sin ser una decisión que Claude Code tome por su cuenta como efecto colateral de
  otra tarea.
- **No usar clases Tailwind fuera de `frontend/src/features/admin/**`** (ver ADR-0001); si parece
  necesario, es una señal para plantear un cambio explícito de convención (PR contra `plan.md` +
  ADR, Principio 3 v3.0.0), no para saltarse la regla en un componente.
- **No empezar trabajo de `002-entorno-servidor` o `003-implantacion`** si el módulo anterior no
  está mergeado a `develop`, salvo instrucción explícita de la persona.
- **No implementar una tarea marcada `[BLOQUEADA por CA-XX]`** inventando un valor para la
  consideración abierta; repórtalo como bloqueado.
- **No saltarse pruebas** para "ir más rápido"; si una tarea parece no necesitarlas, decirlo
  explícitamente y justificar por qué antes de omitirlas, no omitirlas en silencio.
- **No exponer entidades JPA directamente** como respuesta de la API; siempre a través de un DTO.
- **No concatenar SQL con entrada de usuario**, ni siquiera en scripts auxiliares o seeds.
- **No versionar secretos** (`.env` con credenciales reales, claves JWT, etc.) — usar
  `.env.example` con valores ficticios y documentar las variables reales en el runbook de
  despliegue, nunca en el repositorio.
- **No cerrar una tarea de `tasks.md` como completada** si su criterio "Done" no se cumple
  literalmente; actualizar el estado con precisión, no de forma optimista.
- **No implementar funcionalidad fuera del alcance de `spec.md` §3.2** sin antes ampliar la spec.
- **No cambiar el contrato de API de `spec.md` §12** desde el `plan.md` de un módulo — un cambio
  de contrato es siempre un cambio de la spec maestra, con las consecuencias que eso tiene en los
  otros dos módulos.

## 8. Contexto de negocio resumido

- **Certificado de referencia:** IFCD0210 — Desarrollo de aplicaciones con tecnologías web (RD
  1531/2011, mod. RD 628/2013). Toda decisión técnica debería poder justificarse frente a una de
  sus tres unidades de competencia (UC0491_3 cliente, UC0492_3 servidor, UC0493_3
  implantación/verificación/documentación) — ver tabla de trazabilidad en `spec.md` §10, y su nota
  de matiz en §11 sobre el entorno cliente (React reduce la fidelidad literal a UC0491_3 a cambio
  de valor de portfolio; es una decisión consciente, no un descuido).
- **Roles del sistema:** ADMINISTRADOR (jefatura de estudios), DOCENTE, ALUMNO, VISITANTE
  (público, sin autenticar).
- **Dominio central:** un módulo tiene unidades formativas; una unidad formativa tiene tareas y
  recursos; una tarea recibe entregas de alumnado matriculado; una entrega se califica una única
  vez (1–1 con `Evaluacion`).
- **Fuera de alcance en v1.0** (no lo construyas salvo que la spec se amplíe explícitamente):
  mensajería en tiempo real, videoconferencia, integración con Séneca/plataformas autonómicas,
  pagos, app móvil nativa, multi-tenant, internacionalización, módulo MP0391 del certificado
  (prácticas no laborales — no tiene contenido de desarrollo software).
- **Consideraciones abiertas (`spec.md` §13, CA-01 a CA-09):** no están decididas todavía. No las
  resuelvas inventando un valor "razonable" — bloquean específicamente las tareas que dependen de
  ellas (marcadas en los `tasks.md` de cada módulo), el resto del proyecto avanza con normalidad.

## 9. Cuando algo no está claro

Si una tarea no da suficiente detalle para implementarla sin inventar comportamiento no
especificado: para y pregunta, citando el ID de la tarea y la ambigüedad concreta. No asumas un
comportamiento razonable en silencio cuando afecta a datos de alumnado, calificaciones, seguridad,
o al contrato de API compartido entre módulos — esas áreas exigen confirmación explícita antes de
codificar.
