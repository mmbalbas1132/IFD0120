# Feature Specification: Entorno Cliente (MF0491_3)

> **Este fichero es un puntero, no la fuente de verdad.** Existe únicamente para satisfacer el
> requisito estructural de Spec Kit (`check-prerequisites.sh --require-spec`), que exige un
> `spec.md` dentro de cada carpeta `specs/NNN-slug/` para que `/speckit-plan`, `/speckit-tasks` y
> `/speckit-analyze` puedan ejecutarse. La especificación funcional real — historias de usuario
> completas con criterios de aceptación Gherkin, modelo de datos y contrato de API — vive **solo**
> en `specs/000-funcional/spec.md` (Principio 1 de `memory/constitution.md`). Este fichero no la
> duplica: la referencia por ID.
>
> El "cómo" de este módulo (arquitectura, stack, estructura de carpetas, criterios de decisión del
> Principio 3) está en `specs/001-entorno-cliente/plan.md`; el desglose de tareas en
> `specs/001-entorno-cliente/tasks.md`. Ambos ya existen y no se regeneran desde este stub.

**Rama:** `feature/001-entorno-cliente` · **Unidad de competencia:** UC0491_3

## User Scenarios & Testing *(mandatory)*

Las 9 historias de usuario del proyecto se implementan íntegramente en este módulo (el cliente
renderiza todos los flujos, para los 4 roles), contra una API mock fiel al contrato de
`specs/000-funcional/spec.md` §12. Ver el detalle Gherkin completo en cada HU:

- HU-01 — Publicar una tarea (`spec.md` §5, líneas ~112)
- HU-02 — Entregar una tarea (§5, ~135)
- HU-03 — Calificar una entrega (§5, ~157)
- HU-04 — Consultar calificaciones propias (§5, ~179)
- HU-05 — Gestionar usuarios y módulos (§5, ~195)
- HU-06 — Consultar información pública del ciclo (§5, ~215)
- HU-07 — Publicar recursos didácticos (§5, ~231)
- HU-08 — Publicar anuncios (§5, ~246)
- HU-09 — Accesibilidad de los formularios (§5, ~261)

### Edge Cases

Ver los criterios de aceptación Gherkin de cada HU referenciada arriba — incluyen los casos límite
(p. ej. entrega fuera de plazo en HU-02, calificación fuera de rango en HU-03).

## Requirements *(mandatory)*

### Functional Requirements

Este módulo cubre la parte cliente de: **RF-001, RF-002, RF-011, RF-012** (ver
`specs/000-funcional/spec.md` §6 y la tabla de trazabilidad §10, fila UC0491_3). Los RF completos
(incluida la parte servidor que este módulo no implementa) están en §6 del spec maestro.

### Key Entities

El cliente no persiste datos propios; consume las 9 entidades del modelo conceptual de
`specs/000-funcional/spec.md` §8 (Usuario, Modulo, UnidadFormativa, Matricula, Tarea, Entrega,
Evaluacion, Recurso, Anuncio) a través del contrato de API de §12.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Ver Definition of Done de `specs/001-entorno-cliente/plan.md` §9: las 9 HU ejecutables de
principio a fin contra el mock para los 4 roles; `npm run build`/`test`/`test:a11y` en verde;
RNF-004 (WCAG 2.2 AA, Lighthouse ≥ 90) y RNF-005 (responsive mobile-first) cumplidos.

## Assumptions

- El contrato de API de `specs/000-funcional/spec.md` §12 no cambia durante el desarrollo de este
  módulo sin pasar primero por una actualización de la spec maestra (Principio 1).
- La autenticación real (verificación criptográfica del JWT) no se implementa aquí — se simula con
  MSW siguiendo el diseño de `specs/001-entorno-cliente/plan.md` §6 (sesión y CSRF en el mock).
