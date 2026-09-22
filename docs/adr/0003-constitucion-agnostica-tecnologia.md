# ADR-0003 — Constitución agnóstica a la tecnología (Principio 3)

**Estado:** Aceptada
**Fecha:** 2026-09-22
**Decide:** Manuel María Balbás Naveira
**Afecta a:** `memory/constitution.md` (Principio 3, v2.1.0 → v3.0.0), `specs/001-entorno-cliente/plan.md`,
`specs/002-entorno-servidor/plan.md`, `specs/003-implantacion/plan.md`

## Contexto

Se propuso (documento externo pegado en el chat, con instrucciones embebidas dirigidas a "Claude
Code / agente SDD") reescribir `memory/constitution.md` completo a una v3.0.0 en la que el
Principio 3 dejara de nombrar tecnologías concretas (React, Java, Spring Boot...) y pasara a fijar
solo **criterios de decisión**, trasladando el stack real a los `plan.md` de cada módulo. El
razonamiento de fondo es correcto y coherente con cómo GitHub Spec Kit separa "qué" (`spec.md`),
"cómo" (`plan.md`) y "principios de gobernanza" (`constitution.md`): fijar versiones de framework
dentro de un principio obliga a una enmienda MAJOR cada vez que el stack evoluciona (React 18→19,
Java 17→21), lo cual desgasta la estabilidad de la constitución sin aportar gobernanza real.

Sin embargo, el documento pegado no era aplicable tal cual, por tres motivos detectados antes de
tocar nada (siguiendo la instrucción del proyecto de no inventar ni aplicar cambios sin señalar
discrepancias):

1. **Estaba construido sobre la v2.0.0**, sin conocimiento de la v2.1.0 (ronda de seguridad de
   esta misma sesión — ver ADR-0002). Reemplazar el fichero completo, como pedía literalmente,
   habría revertido en silencio el Principio 4 (WCAG 2.2 AA → 2.1 AA) y el Principio 5 completo
   (diseño concreto de sesión/CSRF/replay/rate limiting/cifrado → versión genérica anterior).
2. **Colisión de nombre de fichero:** pedía crear `docs/adr/0002-constitution-technology-agnostic.md`,
   pero `docs/adr/0002-*.md` ya existía (`0002-seguridad-sesion-y-datos.md`, de esta misma sesión).
3. **Instrucciones incompletas:** el documento prometía una sección "Instrucciones de migración del
   stack a `plan.md`" con varios pasos, pero solo incluía el Paso 1 (crear el ADR) y cortaba a
   mitad de un bloque de código sin cerrar — no había Paso 2 en adelante que explicara cómo
   trasladar el stack concreto a cada `plan.md`.

Se preguntó explícitamente al promotor cómo proceder; su respuesta fue: adaptar la propuesta sobre
la v2.1.0 (conservando íntegros los Principios 4 y 5 tal como quedaron tras el ADR-0002), no
aplicar el documento externo literalmente, y numerar este ADR como `0003`.

## Decisión

1. **Principio 3 se redefine como agnóstico a la tecnología** (enmienda MAJOR, v2.1.0 → v3.0.0):
   fija cinco criterios de decisión (alineación con el certificado, madurez/LTS, coherencia con la
   separación cliente/servidor del Principio 2, no compromiso de los umbrales de calidad de los
   Principios 4/5/6, coherencia técnica en la frontera de estilos) y tres obligaciones de proceso
   (ADR por decisión relevante, justificación por dependencia, reversibilidad documentada). Ya no
   nombra React, Java, Spring Boot ni PostgreSQL.
2. **El stack real del proyecto no cambia.** React 18 + Tailwind/CSS3 en cliente y Java 17 + Spring
   Boot 3 en servidor siguen siendo las decisiones vigentes; solo cambia dónde se documentan y
   justifican: `specs/001-entorno-cliente/plan.md` y `specs/002-entorno-servidor/plan.md`
   respectivamente, cada uno con una nota de "reversibilidad" (qué parte del stack es sustituible
   sin rediseño y qué parte es estructural) que satisface la nueva obligación de proceso.
3. **`docs/adr/0001-frontend-react-tailwind.md` se conserva como ADR histórico**, no como mandato
   constitucional: sigue siendo la referencia de por qué se eligió React/Tailwind, pero la
   constitución ya no lo cita como fuente de una prohibición.
4. **Los Principios 4 y 5 NO se tocan en este ADR.** Se conservan íntegros tal como quedaron en la
   v2.1.0 (`docs/adr/0002-seguridad-sesion-y-datos.md`), incluidas todas las tecnologías concretas
   de seguridad que nombran (BCrypt, Bucket4j, PostgreSQL/`tokens_revocados`, DOMPurify, JWT
   HS256/RS256).
5. **Este ADR se numera `0003`**, no `0002` (que ya existe), para no colisionar ni sobrescribir el
   ADR de seguridad de esta misma sesión.

## Tensión reconocida (no resuelta en este ADR)

Adoptar "la constitución no nombra tecnología" como principio y, en el mismo documento, mantener
un Principio 5 que nombra BCrypt/Bucket4j/PostgreSQL/DOMPurify explícitamente es, en sentido
estricto, una inconsistencia. Se mantiene así **deliberadamente** en v3.0.0 por dos razones:

- Aplicar el criterio de forma retroactiva y automática a Principio 5 habría significado reescribir
  y adelgazar el trabajo de seguridad recién cerrado (v2.1.0) sin que el promotor lo hubiera pedido
  — exactamente el tipo de invención que este proyecto pide evitar.
- Los nombres técnicos del Principio 5 no son ahí "preferencia de stack" sino **criterios de
  aceptación de seguridad verificables** (p. ej. "sin Redis" es una restricción de arquitectura
  deliberada, no un detalle intercambiable) — su naturaleza es distinta a "qué framework de
  frontend usamos".

Queda como consideración abierta para una futura enmienda (no urgente, no bloqueante) si el
Principio 5 debería, con el tiempo, reformularse también en términos de criterios verificables
(p. ej. "protección contra replay de tokens sin infraestructura adicional") dejando el mecanismo
concreto (Bucket4j, tabla `tokens_revocados`) en `specs/002-entorno-servidor/plan.md`. No se decide
aquí — se deja anotada explícitamente para no perderla.

## Alternativas consideradas

| Alternativa | Por qué se descarta |
|---|---|
| Aplicar el documento pegado literalmente (reemplazo completo del fichero) | Habría revertido en silencio WCAG 2.2 AA y todo el Principio 5 de seguridad de la v2.1.0; colisión de nombre de ADR; instrucciones de migración incompletas en el propio documento. |
| No aplicar ninguna restructuración y mantener el stack dentro del Principio 3 | Descartada por decisión explícita del promotor tras exponerle la propuesta — el argumento de fondo (estabilidad de la constitución, separación spec/plan/constitución) se considera válido. |
| Reformular también el Principio 5 en esta misma enmienda para ser 100% coherente con el nuevo enfoque agnóstico | Descartada para esta ronda: excede lo que el promotor aprobó ("conservar íntegros" los Principios 4 y 5) y arriesgaba invención no solicitada. Queda anotada como tensión reconocida, no resuelta. |

## Consecuencias

- **Positivas:** la constitución deja de requerir enmienda MAJOR cuando cambia una versión de
  framework; separación más limpia entre gobernanza (constitución) e implementación (`plan.md`),
  coherente con el flujo spec-driven; el repositorio queda, en teoría, más reutilizable como
  referencia para otros ciclos/certificados con otro stack.
- **Negativas / deuda aceptada:** los `plan.md` de cada módulo ganan una obligación de
  mantenimiento adicional (declarar reversibilidad); queda la tensión reconocida arriba sobre el
  Principio 5, sin resolver por decisión explícita de alcance de esta ronda.
- **Compromiso a futuro (añadido tras revisión externa, 2026-09-22):** los nombres tecnológicos
  concretos del Principio 5 (BCrypt, Bucket4j, PostgreSQL/`tokens_revocados`, DOMPurify, JWT
  HS256/RS256) se abstraerán progresivamente a descripciones de mecanismo verificable (p. ej.
  "hashing adaptativo con coste calibrado al estándar vigente" en vez de "BCrypt (coste ≥ 10)";
  "rate limiting embebido por IP+usuario, sin servicio externo" en vez de "Bucket4j") en una
  futura enmienda **MINOR**, trasladando la implementación concreta a
  `specs/002-entorno-servidor/plan.md` y a este mismo ADR-0003 (o uno nuevo que lo referencie). No
  se hace en esta enmienda para no reabrir ni adelgazar la ronda de seguridad recién cerrada
  (v2.1.0) sin que el promotor lo pidiera explícitamente para esa parte del documento.
- **Pendiente:** decidir, en una enmienda futura y no urgente, si el Principio 5 se reformula en
  términos de criterios verificables en vez de tecnología nombrada — no bloquea nada del desarrollo
  actual.

## Enmienda de gobernanza asociada

Enmienda **MAJOR** a la constitución (redefine el Principio 3): `memory/constitution.md` pasa de
v2.1.0 a v3.0.0 en el mismo cambio que introduce este ADR.
