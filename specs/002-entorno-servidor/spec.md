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
satisface los 37 endpoints del contrato de `specs/000-funcional/spec.md` §12 (v1.8), ya consumidos
simulados por `001-entorno-cliente`. Las 9 HU (`spec.md` §5) son las mismas que en el módulo
cliente — este módulo las hace reales en vez de mockeadas; no introduce HU nuevas.

### Edge Cases

Casos de error de cada endpoint según el contrato de §12 (401/403/404/409/422) y los casos límite
de seguridad del Principio 5 (replay de tokens, fuerza bruta, propiedad de recurso) — ver
`docs/adr/0002-seguridad-sesion-y-datos.md`.

## Requirements *(mandatory)*

### Functional Requirements

Este módulo cubre la parte servidor de **RF-001 a RF-019** (todas; RF-002, RF-006, RF-011, RF-018
y RF-019 también tienen parte cliente, ya hecha en `001`) y de las no funcionales **RNF-002,
RNF-003, RNF-007, RNF-008, RNF-009, RNF-010, RNF-011, RNF-012, RNF-013 y RNF-014** (ver
`specs/000-funcional/spec.md` §6, §7 y la tabla de trazabilidad §10, fila UC0492_3). RNF-001
(rendimiento) se mide en `003-implantacion`.

### Key Entities

Implementa la persistencia real de las 12 entidades del modelo conceptual de
`specs/000-funcional/spec.md` §8 (incluidas `Ciclo`, `HistorialEvaluacion` y `Adjunto`), más las
tablas `sesiones_refresco` y `tokens_revocados` (Principio 5 / ADR-0002, no son parte del modelo de
negocio sino del mecanismo de sesión) — ver `specs/002-entorno-servidor/plan.md` §5.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Ver Definition of Done de `specs/002-entorno-servidor/plan.md` §9: los 37 endpoints de §12
implementados y probados; CI en verde con cobertura `service` ≥ 70% (JaCoCo) y Javadoc
verificado; `/swagger-ui.html` navegable; contrato y forma de los cuerpos verificados contra §12 y
el mock de `001` sin discrepancias; TS.27–TS.33, TS.35, TS.40 y TS.42 (seguridad) probadas.

## Assumptions

- El contrato de API de `specs/000-funcional/spec.md` §12 no cambia durante el desarrollo de este
  módulo sin pasar primero por una actualización de la spec maestra (Principio 1).
- CA-01 (almacenamiento de ficheros) está **resuelta** desde la spec v1.4 (RNF-014): TS.26 y TS.43
  no están bloqueadas.
- CA-05 (base legal y retención RGPD) sigue parcialmente abierta: TS.33 construye la
  anonimización como mecanismo manual y no decide cuándo se aplica.
- CA-08 (infraestructura de `prod`) no bloquea este módulo; solo condiciona si el rate limiter en
  memoria (TS.30) deberá compartir contadores en `003`.
