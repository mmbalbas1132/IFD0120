# ADR-0001 — Entorno cliente: React en toda la aplicación, Tailwind CSS solo en administración

**Estado:** Aceptada
**Fecha:** 2026-09-22
**Decide:** Manuel María Balbás Naveira
**Afecta a:** `memory/constitution.md` (Principio 3, v1.0.0 → v2.0.0), `specs/000-funcional/spec.md` §11,
`specs/001-entorno-cliente/plan.md`

## Contexto

La constitución v1.0.0 de GestorFP fijaba, para el entorno cliente, HTML5 + CSS3 + JavaScript
ES6+ **sin framework**, con una justificación explícita: el certificado de referencia IFCD0210
evalúa en UC0491_3/UF1842 el dominio directo de manipulación del DOM, gestión de eventos y
peticiones asíncronas mediante lenguajes de guión, sin la abstracción que introduce un framework
como React, Vue o Angular. Esa era la lectura más fiel al documento fundacional del proyecto.

Sin embargo, GestorFP tiene un segundo objetivo declarado desde el origen (OB-4 y OB-5 en
`spec.md`): servir tanto de proyecto de referencia docente del certificado como de pieza de
portfolio para búsqueda de empleo remoto. React es, con diferencia, el framework de frontend más
demandado en el mercado al que ese portfolio se dirige; un cliente 100% vanilla JS, aunque más
fiel al certificado, tiene menor valor de mercado como muestra de trabajo.

Adicionalmente, se planteó el uso de Tailwind CSS para acelerar el desarrollo de las vistas, lo
que introduce una segunda tensión: Tailwind es compatible técnicamente con cualquier arquitectura
de cliente (no depende de React), pero sustituye la escritura manual de reglas CSS por clases de
utilidad, lo cual también se aleja de lo que UF1841 ("Hojas de Estilo web") busca evaluar.

## Decisión

1. El entorno cliente completo (`specs/001-entorno-cliente/`) se construye con **React 18** (Vite,
   componentes funcionales, hooks), no con JavaScript vanilla.
2. **Tailwind CSS** se usa exclusivamente en las vistas de administración
   (`src/features/admin/**`); las vistas de docente, alumno y el panel público usan **CSS3 escrito
   a mano** (CSS Modules), sin clases de utilidad de Tailwind. Esta frontera se aplica técnicamente
   acotando el `content` (purge) de Tailwind a esa carpeta — una clase de Tailwind usada fuera de
   `features/admin/**` no compila y no produce estilo, lo que convierte la regla en algo más que
   una convención de equipo.
3. Se amplía la constitución (Principio 3, v2.0.0) para reflejar este cambio, y la trazabilidad de
   `spec.md` §10 se acompaña de una nota (§11) que explica la desviación respecto al certificado.

## Alternativas consideradas

| Alternativa | Por qué se descarta |
|---|---|
| Vanilla JS + CSS3 (plan original) | Máxima fidelidad al certificado; menor valor de portfolio. Se pierde si se necesita evidencia estricta de UF1842/UF1841 (ver Consecuencias). |
| React en todo + Tailwind en todo | Máxima velocidad y consistencia visual; renuncia total a evidenciar CSS3 manual en cualquier vista, incluso las más alineadas con UF1841. |
| Framework ligero sin build (Alpine.js) + CSS3 | Término medio técnico, pero no aporta el valor de portfolio que motiva esta decisión (Alpine no es lo que piden las ofertas de trabajo a las que se orienta OB-5). |

## Consecuencias

- **Positivas:** stack más representativo del mercado laboral; Tailwind acelera las vistas de
  administración, que son las de mayor superficie de formularios y tablas; las vistas de
  docente/alumno conservan una demostración parcial de CSS3 manual.
- **Negativas / deuda aceptada:** el proyecto, tal como queda planteado, **no** demuestra por sí
  mismo las técnicas exactas que UC0491_3/UF1842 evalúa (DOM/eventos/AJAX sin framework). Si en
  el futuro se necesita esa evidencia con fines de certificación, se deberá crear un ejercicio o
  rama aparte en JavaScript vanilla — no está cubierto por `001-entorno-cliente` (ver
  `spec.md` §11, "Consecuencia práctica").
- **Neutras:** la accesibilidad (WCAG 2.1 AA, RNF-004) no se ve afectada — es exigible con React
  igual que con HTML plano, y así queda explícito en `spec.md`.

## Enmienda de gobernanza asociada

Esta decisión constituye una enmienda **MAJOR** a la constitución (redefine un principio), según
sus propias reglas de gobernanza: `memory/constitution.md` pasa de v1.0.0 a v2.0.0 en el mismo
cambio que introduce este ADR.
