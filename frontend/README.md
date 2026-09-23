# GestorFP — Entorno cliente (MF0491_3)

Cliente React de GestorFP, construido en `feature/001-entorno-cliente` contra una **API
simulada** (Mock Service Worker) que implementa fielmente el contrato de
`specs/000-funcional/spec.md` §12. No depende de que `002-entorno-servidor` exista todavía — ver
`specs/001-entorno-cliente/plan.md`.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. MSW arranca automáticamente (no hay backend real que levantar) y
expone los 4 roles con la misma contraseña simulada para todos: **`Password123!`**.

| Rol | Email |
|---|---|
| ADMINISTRADOR | `admin@gestorfp.test` |
| DOCENTE | `docente1@gestorfp.test` / `docente2@gestorfp.test` |
| ALUMNO | `alumno1@gestorfp.test` / `alumno2@gestorfp.test` |
| VISITANTE | (sin login) `/` — panel público |

### Estado del mock y recarga del navegador

El "backend" de este módulo es un objeto en memoria (`src/mocks/db.js`), sembrado desde
`src/mocks/fixtures/*.js`. Crear una tarea/entrega/recurso/anuncio durante una sesión de
`npm run dev` se refleja en las siguientes peticiones, pero **se pierde al cerrar la pestaña**
(no es una base de datos real). La sesión de autenticación (cookies `refresh_token`/`csrf_token`
+ el registro de sesión asociado) sí sobrevive a un F5 real gracias a `sessionStorage` — ver el
comentario al inicio de `src/mocks/db.js` para el porqué.

## Comandos

```bash
npm run dev         # servidor de desarrollo con MSW activo
npm run build        # build de producción (dist/)
npm run preview       # sirve el build de producción
npm run test          # Vitest — componentes, httpClient, contrato MSW, build sin mock (57 pruebas)
npm run test:a11y     # Vitest + vitest-axe — 12 páginas, WCAG 2.2 AA, 0 violaciones críticas/serias
npm run lint          # ESLint (incluye eslint-plugin-tailwindcss)
npm run format         # Prettier
```

## Cómo se desactivará el mock en `003-implantacion`

Cuando `002-entorno-servidor` exista, `003-implantacion` apunta el cliente a la API real:

1. Definir `VITE_API_BASE_URL=http://localhost:8080/api/v1` (u otro origen) en
   `frontend/.env.integration` — `httpClient.js` ya lo lee vía
   `import.meta.env.VITE_API_BASE_URL`.
2. En `src/main.jsx`, `activarMocks()` ya comprueba `VITE_API_BASE_URL`: si está definida, **no**
   arranca MSW. No hace falta tocar ningún componente ni `AuthContext.jsx` (plan.md §6).
3. Ejecutar las 9 HU manualmente contra el sistema real (Paso 0 de
   `specs/003-implantacion/plan.md`) antes de automatizar nada.

**El mock nunca va en el build de producción (TC.19).** `activarMocks()` solo arranca MSW con
`import.meta.env.MODE === 'development'` (es decir, `npm run dev`), así que `npm run build`
elimina `src/mocks/**` (fixtures y contraseña simulada incluidas) del bundle aunque falte
`VITE_API_BASE_URL`; `vite.config.js` además borra `mockServiceWorker.js` de `dist/`.
`tests/buildProduccion.test.js` lo verifica construyendo de verdad y buscando restos del mock.
Las credenciales reales solo existirán en el backend (BCrypt, RNF-002).

## Frontera Tailwind / CSS3 (ADR-0001)

Solo `src/features/admin/**` usa clases Tailwind (`tailwind.config.js`, `content` acotado a esa
carpeta; `corePlugins.preflight` desactivado para no chocar con el reset compartido de
`src/styles/base.css`). El resto del cliente (`publico`, `alumno`, `docente`,
`components/compartidos`) usa CSS Modules escritos a mano. Verificado en TC.2: una clase Tailwind
escrita fuera de `features/admin` no se compila.

## Limitaciones conocidas de este módulo

- **Contrato de API — dos huecos resueltos de forma pragmática en el mock:** `spec.md` §12 no
  define un endpoint propio para listar las unidades formativas de un módulo ni las
  matriculaciones activas de un módulo (solo `POST`/`DELETE` por id). El mock las devuelve
  embebidas en cada módulo (`GET /modulos` → `unidadesFormativas`, `matriculas`). Esto debe
  reconciliarse explícitamente en el Paso 0 de `003-implantacion/plan.md` cuando `002` defina el
  contrato real: si el servidor real no expone esos campos embebidos, `modulosApi.js` y las
  páginas que los consumen (`ListaTareas`, `FormularioTarea`, `FormularioRecurso`,
  `FormularioModulo`, `GestionMatriculas`) necesitarán ajustarse.
- **`npm run test:a11y` en jsdom:** axe-core registra internamente
  `Error: Not implemented: HTMLCanvasElement.prototype.getContext` en stderr durante la regla de
  contraste de color (jsdom no implementa Canvas). No hace fallar las pruebas, pero significa que
  esa regla concreta puede no verificarse con la misma fidelidad que en un navegador real — TC.15
  de `003-implantacion` (axe-core dentro de Playwright, navegador real) es la verificación
  definitiva de contraste.
- **Responsive (TC.16):** los 3 breakpoints (480/768/1024px) están implementados con CSS
  mobile-first en cada `*.module.css` (ver comentarios `@media` en cada uno) y se verificaron
  manualmente en un navegador real durante el desarrollo, pero no se pudieron adjuntar capturas
  automatizadas por una limitación de la herramienta de automatización de navegador usada en esta
  sesión (el resize de ventana no se propagó al viewport de la pestaña). Pendiente una pasada
  manual con capturas reales antes de cerrar el PR, tal y como exige el checklist de cierre del
  módulo.
