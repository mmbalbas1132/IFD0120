# Instrucciones de contribución — GestorFP

Estas instrucciones aplican a cualquier colaborador humano y a cualquier asistente de código
(GitHub Copilot, Claude Code, etc.) que proponga cambios en este repositorio. Complementan, sin
sustituir, a `memory/constitution.md` y `CLAUDE.md`.

El proyecto se desarrolla en **tres ramas secuenciales**, una por módulo del certificado:
`feature/001-entorno-cliente` → `feature/002-entorno-servidor` → `feature/003-implantacion`. Cada
PR va dirigido a `develop` desde la rama de su módulo — no se abren PRs que mezclen trabajo de dos
módulos distintos.

## Antes de abrir un Pull Request

1. El cambio está respaldado por una historia de usuario en `specs/000-funcional/spec.md` y una
   tarea en el `tasks.md` del módulo activo (referencia su ID — `TC.x`, `TS.x` o `TI.x` — en el
   título o descripción del PR).
2. Si el PR es de `feature/002-entorno-servidor` o posterior: `mvn verify` (backend) pasa en
   local, incluyendo el informe de cobertura JaCoCo.
3. Si el PR es de `feature/001-entorno-cliente`: `npm run test` y `npm run test:a11y` pasan en
   local.
4. Si el PR es de `feature/003-implantacion`: `npx playwright test` (E2E) pasa en local para los
   flujos afectados.
5. Si el cambio toca el frontend, se ha comprobado accesibilidad (axe-core) en las páginas
   modificadas, y ninguna clase Tailwind aparece fuera de `frontend/src/features/admin/**`
   (ver `docs/adr/0001-frontend-react-tailwind.md`).
6. Si el cambio toca el esquema de base de datos, se añade una migración Flyway nueva (nunca se
   edita una ya aplicada en `main`).
7. Si el cambio toca el contrato de API (endpoint, DTO, código de estado), se ha actualizado
   primero `specs/000-funcional/spec.md` §12 — no se cambia el contrato desde el `plan.md` de un
   módulo.
8. No hay secretos, credenciales ni ficheros `.env` reales en el diff.

## Plantilla de Pull Request

```markdown
## Módulo
[ ] 001-entorno-cliente  [ ] 002-entorno-servidor  [ ] 003-implantacion

## Qué cambia
<resumen en 1-3 frases>

## Por qué
Refs: TC.x / TS.x / TI.x (tasks.md del módulo) · RF-0XX / HU-0X (specs/000-funcional/spec.md)

## Cómo se ha probado
- [ ] `mvn verify` en verde (si aplica — cobertura adjunta o enlace a CI)
- [ ] `npm run test` / `npm run test:a11y` en verde (si aplica)
- [ ] Pruebas E2E relevantes en verde (si aplica)
- [ ] Sin clases Tailwind fuera de `features/admin/**` (si toca frontend)
- [ ] Migración Flyway añadida (si aplica a base de datos)

## Capturas / evidencias
<opcional, especialmente para cambios de UI>

## Riesgos, bloqueos (CA-XX) o seguimientos pendientes
<opcional>
```

## Plantilla de Issue

```markdown
**Tipo:** bug | feature | deuda técnica | documentación | consideración abierta (CA-XX)

**Descripción**
<qué ocurre o qué se necesita>

**Contexto**
- Módulo afectado: 001-entorno-cliente / 002-entorno-servidor / 003-implantacion / docs
- Relacionado con: RF-0XX / HU-0X (specs/000-funcional/spec.md) si aplica

**Pasos para reproducir** (solo si es un bug)
1. ...
2. ...

**Comportamiento esperado**
<...>

**Comportamiento actual**
<...>
```

## Checklist de calidad (resumen ejecutable)

| Verificación | Comando / método | Bloqueante | Módulo |
|---|---|---|---|
| Compilación backend | `mvn -q compile` | Sí | 002, 003 |
| Pruebas backend + cobertura | `mvn verify` (JaCoCo ≥ 70% en `service`) | Sí | 002, 003 |
| Pruebas de componentes frontend | `npm run test` | Sí | 001 |
| Accesibilidad | `npm run test:a11y` (001) o axe-core en Playwright (003) | Sí | 001, 003 |
| Frontera Tailwind/CSS3 | `eslint-plugin-tailwindcss` (clases Tailwind solo en `features/admin/**`) | Sí | 001 |
| Pruebas E2E de los flujos tocados | `npx playwright test` | Sí | 003 |
| Análisis de dependencias (SCA) | OWASP Dependency-Check en CI | Sí | 003 |
| Documentación OpenAPI actualizada | Revisión manual de `/swagger-ui.html` en `dev` | Si el PR añade/cambia un endpoint | 002 |
| Migración Flyway revisada | Revisión manual: aditiva, reversible, nombrada correctamente | Si el PR toca el esquema | 002 |
| Contrato de API sin cambios no autorizados | Comparación contra `spec.md` §12 | Sí | 002, 003 |
| Constitución respetada | Revisión manual contra `memory/constitution.md` v3.0.0 | Sí | Todos |

## Revisión de código

- Ningún PR se auto-aprueba. Al menos una revisión (humana o de un agente configurado para ello)
  antes de mergear a `develop`.
- Un PR que introduce comportamiento no cubierto por `specs/000-funcional/spec.md` se rechaza o se
  pausa hasta que la spec maestra se actualice — no se negocia el orden spec → plan → tasks →
  código, ni se cambia el contrato de API desde un módulo.
- Un PR que reduce la cobertura de la capa `service` por debajo del 70% no se mergea sin
  justificación explícita aprobada por escrito en el propio PR.
- Un PR de `feature/002-entorno-servidor` no se abre antes de que `feature/001-entorno-cliente`
  esté mergeada a `develop` (ídem `003` respecto a `002`), salvo instrucción explícita en
  contrario documentada en el propio PR.
- Una tarea marcada `[BLOQUEADA por CA-XX]` en un `tasks.md` no se cierra con un valor inventado:
  el PR que la toca debe declarar explícitamente que sigue bloqueada, o traer la resolución de
  esa consideración abierta desde `specs/000-funcional/spec.md` §13.
