# Feature Specification: Implantación (MF0493_3)

> **Este fichero es un puntero, no la fuente de verdad.** Existe únicamente para satisfacer el
> requisito estructural de Spec Kit (`check-prerequisites.sh --require-spec`), que exige un
> `spec.md` dentro de cada carpeta `specs/NNN-slug/` para que `/speckit-plan`, `/speckit-tasks` y
> `/speckit-analyze` puedan ejecutarse. La especificación funcional real vive **solo** en
> `specs/000-funcional/spec.md` (Principio 1 de `memory/constitution.md`). Este fichero no la
> duplica: la referencia por ID.
>
> El "cómo" de este módulo (integración, pruebas E2E, despliegue) está en
> `specs/003-implantacion/plan.md`; el desglose de tareas en `specs/003-implantacion/tasks.md`.
> Ambos ya existen y no se regeneran desde este stub.

**Rama:** `feature/003-implantacion` (se abre tras mergear `feature/002-entorno-servidor`) ·
**Unidad de competencia:** UC0493_3

## User Scenarios & Testing *(mandatory)*

Este módulo no añade HU nuevas: integra `001-entorno-cliente` y `002-entorno-servidor` (desactiva
el mock MSW, apunta el cliente a la API real) y verifica las 9 HU de `specs/000-funcional/spec.md`
§5 de extremo a extremo contra el sistema completo, con Playwright.

### Edge Cases

Cualquier discrepancia entre lo que el cliente espera y lo que el servidor entrega se corrige
contra el contrato de §12 — nunca se parchea localmente en un solo lado (ver
`specs/003-implantacion/plan.md` §2, Paso 0).

## Requirements *(mandatory)*

### Functional Requirements

Este módulo cubre: **RF-011, RF-014, RF-015** (despliegue, documentación, pruebas) y las no
funcionales **RNF-001 (rendimiento), RNF-007, RNF-009** (ver `specs/000-funcional/spec.md` §6, §7 y
la tabla de trazabilidad §10, fila UC0493_3).

### Key Entities

No introduce entidades nuevas; opera sobre el sistema íntegro (cliente + servidor + PostgreSQL) ya
construido en los dos módulos anteriores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Ver Definition of Done de `specs/003-implantacion/plan.md` §7: suite E2E + accesibilidad +
rendimiento en verde en CI; `docker-compose.prod.yml` desplegado con éxito en un entorno de
prueba con TLS válido; runbook de despliegue/rollback probado; TI.7 verificada (no bloqueada);
CA-01 y la parte legal de CA-05 resueltas antes de cualquier despliegue con datos reales.

## Assumptions

- CA-08 (infraestructura de producción concreta) y CA-09 (tamaño real del ciclo para pruebas de
  carga) siguen abiertas — no se asume una respuesta.
- No se despliega a `prod` con datos reales de alumnado mientras CA-01 o la parte legal de CA-05
  sigan sin resolver (ver `specs/003-implantacion/tasks.md`, cierre del módulo).
