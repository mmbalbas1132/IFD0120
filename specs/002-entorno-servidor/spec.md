# Feature Specification: Entorno Servidor (MF0492_3)

> **Este fichero es un puntero, no la fuente de verdad.** Existe únicamente para satisfacer el
> requisito estructural de Spec Kit (`check-prerequisites.sh --require-spec`), que exige un
> `spec.md` dentro de cada carpeta `specs/NNN-slug/` para que `/speckit-plan`, `/speckit-tasks` y
> `/speckit-analyze` puedan ejecutarse. La especificación funcional real vive **solo** en
> `specs/000-funcional/spec.md` (Principio 1 de `memory/constitution.md`). Este fichero no la
> duplica: la referencia por ID.
>
> El "cómo" de este módulo (arquitectura, stack, esquema de BD, autenticación/autorización) está en
> `specs/002-entorno-servidor/plan.md`; el desglose de tareas en
> `specs/002-entorno-servidor/tasks.md`. Ambos ya existen y no se regeneran desde este stub.

**Rama:** `feature/002-entorno-servidor` (se abre tras mergear `feature/001-entorno-cliente`) ·
**Unidad de competencia:** UC0492_3

## User Scenarios & Testing *(mandatory)*

Este módulo implementa la lógica de negocio real (persistencia, autenticación, autorización) que
satisface los 23 endpoints del contrato de `specs/000-funcional/spec.md` §12, ya consumidos
simulados por `001-entorno-cliente`. Las 9 HU (`spec.md` §5) son las mismas que en el módulo
cliente — este módulo las hace reales en vez de mockeadas; no introduce HU nuevas.

### Edge Cases

Casos de error de cada endpoint según el contrato de §12 (401/403/404/409/422) y los casos límite
de seguridad del Principio 5 (replay de tokens, fuerza bruta, propiedad de recurso) — ver
`docs/adr/0002-seguridad-sesion-y-datos.md`.

## Requirements *(mandatory)*

### Functional Requirements

Este módulo cubre la parte servidor de: **RF-001, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008,
RF-009, RF-010, RF-012, RF-013, RF-014, RF-015** y las no funcionales de seguridad **RNF-002,
RNF-003, RNF-011, RNF-012, RNF-013** (ver `specs/000-funcional/spec.md` §6, §7 y la tabla de
trazabilidad §10, fila UC0492_3).

### Key Entities

Implementa la persistencia real de las 9 entidades del modelo conceptual de
`specs/000-funcional/spec.md` §8, más la tabla `tokens_revocados` (Principio 5 / ADR-0002, no es
parte del modelo de negocio sino del mecanismo de seguridad) — ver
`specs/002-entorno-servidor/plan.md` §5.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Ver Definition of Done de `specs/002-entorno-servidor/plan.md` §9: los 23 endpoints de §12
implementados y probados; cobertura `service` ≥ 70% (JaCoCo); `/swagger-ui.html` navegable;
contrato verificado contra §12 sin discrepancias; TS.27–TS.33 (seguridad) probadas.

## Assumptions

- El contrato de API de `specs/000-funcional/spec.md` §12 no cambia durante el desarrollo de este
  módulo sin pasar primero por una actualización de la spec maestra (Principio 1).
- CA-01 (almacenamiento de ficheros) sigue abierta — la tarea TS.26 queda explícitamente bloqueada,
  no se inventa una solución.
