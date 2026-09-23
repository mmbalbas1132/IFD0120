# Desglose de Tareas — 001 · Entorno Cliente (MF0491_3)

**Basado en:** `plan.md` (misma carpeta) y `specs/000-funcional/spec.md` (HU/RF/contrato §12)
**Rama:** `feature/001-entorno-cliente` — se abre desde `develop`, se mergea a `develop` al cierre.
**Convenciones:** S (≤4h) · M (0.5–2d) · L (>2d) · `[P]` paralelizable · Done verificable.

| ID | Descripción | Done | Est. | Deps | Archivos | HU/RF |
|---|---|---|---|---|---|---|
| [X] TC.1 | Inicializar proyecto Vite + React 18 + ESLint/Prettier | `npm run dev` sirve una página en blanco sin errores de consola | S | — | `frontend/{package.json,vite.config.js}` | — |
| [X] TC.2 [P] | Configurar Tailwind CSS con `content` acotado a `features/admin/**` | Clase Tailwind en `features/admin` se compila; la misma clase en `features/docente` no genera estilo (verificado a propósito) | S | TC.1 | `tailwind.config.js`, `postcss.config.js` | ADR-0001 |
| [X] TC.3 [P] | `styles/variables.css` + `styles/base.css` (tokens de color, contraste ≥4.5:1, tipografía) | Paleta documentada y verificada con un checker de contraste | S | TC.1 | `src/styles/*.css` | RNF-004 |
| [X] TC.4 | Configurar MSW: `mocks/handlers/` cubriendo el 100% de endpoints de `spec.md` §12, incluyendo `POST /auth/login`/`refresh`/`logout` con cookies `refresh_token`/`csrf_token` simuladas (`plan.md` §6) | Cada fila de la tabla del contrato tiene un handler; smoke test lo confirma; handler de login expone las dos cookies simuladas | M | TC.1 | `src/mocks/**` | §12 |
| [X] TC.5 | `mocks/fixtures/`: datos de ejemplo para los 4 roles, 2+ módulos, tareas en varios estados | Fixtures cubren al menos un caso de éxito y uno de borde por HU (p. ej. entrega fuera de plazo) | S | TC.4 | `src/mocks/fixtures/*.js` | HU-01..09 |
| [X] TC.6 | `api/httpClient.js`: wrapper de `fetch` con `credentials: 'include'`, inyección de `Authorization` (access token en memoria) y de `X-CSRF-Token` (leído de la cookie `csrf_token`) en mutaciones, mapeo de errores del contrato §12 a excepciones tipadas | Prueba unitaria: error 422 del mock se propaga como excepción con `status` y `message`; mutación sin CSRF válido → excepción `403` propagada | M | TC.4 | `src/api/httpClient.js` | RF-002, RF-006, RNF-003 |
| [X] TC.7 [P] | `auth/AuthContext.jsx` + `RutaProtegida.jsx`: access token **solo en memoria** (nunca `localStorage`), renovación automática contra `POST /auth/refresh` al arrancar, rol activo, guardia de rutas | Ruta `/admin` inaccesible sin rol ADMINISTRADOR simulado (redirige a login); tras recargar la página, la sesión se recupera vía `/auth/refresh` sin pedir credenciales de nuevo (si la cookie simulada sigue vigente) | M | TC.6 | `src/auth/*.jsx` | RF-014, RNF-002 |
| [X] TC.7b [P] | Prueba de contrato CSRF en `httpClient.js`: handlers de MSW para `POST`/`PUT`/`DELETE` devuelven `403` si `X-CSRF-Token` no coincide con la cookie `csrf_token` emitida | Prueba: mutación con cabecera ausente o incorrecta → `403` capturado por `httpClient.js`; con cabecera correcta → pasa | S | TC.4, TC.6 | `src/mocks/handlers/*.js`, `src/api/httpClient.test.js` | RNF-003 |
| [X] TC.8 [P] | `features/publico/PanelPublico.jsx` (HU-06) | RF-011: visible sin login, responsive, sin datos de alumnado, consumiendo `modulosApi.js` | M | TC.4, TC.6 | `src/features/publico/*`, `src/api/modulosApi.js` | HU-06, RF-011 |
| [X] TC.9 | `features/docente/FormularioTarea.jsx` + `ListaTareas` (HU-01) | RF-001/002: validación de fecha límite futura en cliente con mensaje accesible; envío contra el mock | M | TC.6, TC.7 | `src/features/docente/FormularioTarea.jsx` | HU-01, RF-001, RF-002 |
| [X] TC.10 | `features/alumno/FormularioEntrega.jsx` (HU-02) | RF-003/004: sube fichero/comentario; estado fuera de plazo visible tras el mock devolverlo | M | TC.6, TC.7 | `src/features/alumno/FormularioEntrega.jsx` | HU-02, RF-003, RF-004 |
| [X] TC.11 | `features/docente/FormularioCalificacion.jsx` + `ListaEntregas` (HU-03) | RF-005/006: validación 0–10 en cliente con mensaje accesible antes de enviar | M | TC.6, TC.7 | `src/features/docente/{FormularioCalificacion,ListaEntregas}.jsx` | HU-03, RF-005, RF-006 |
| [X] TC.12 | `features/alumno/MisCalificaciones.jsx` (HU-04) | RF-007: agrupado por módulo/UF, solo datos propios del usuario simulado en sesión | M | TC.6, TC.7 | `src/features/alumno/MisCalificaciones.jsx` | HU-04, RF-007 |
| [X] TC.13 [P] | `features/admin/{TablaUsuarios,FormularioModulo,GestionMatriculas}.jsx` (HU-05) — usa Tailwind | RF-008/009/010: formularios accesibles con clases Tailwind; error de código duplicado mostrado desde el mock (409) | L | TC.2, TC.6, TC.7 | `src/features/admin/*.jsx` | HU-05, RF-008, RF-009, RF-010 |
| [X] TC.14 [P] | `features/docente/{FormularioRecurso,FormularioAnuncio}.jsx` (HU-07, HU-08) | RF-012/013 con los 3 tipos de recurso y el flag de anuncio destacado | M | TC.6, TC.7 | `src/features/docente/{FormularioRecurso,FormularioAnuncio}.jsx` | HU-07, HU-08, RF-012, RF-013 |
| [X] TC.15 | Pasada de accesibilidad WCAG 2.2 AA en las 9 páginas (labels, foco, `aria-live`, orden de tabulación) | `vitest-axe` sin violaciones críticas/serias en ninguna página; verificación manual de teclado | L | TC.8–TC.14 | todo `src/features/**` | RNF-004, HU-09 |
| TC.16 | Responsive mobile-first en las 9 páginas (480/768/1024px) | Sin scroll horizontal ni solapes en los 3 breakpoints, verificado manualmente con capturas adjuntas al PR | M | TC.8–TC.14 | `src/styles/*.css`, módulos CSS de cada `features/*` | RNF-005, RNF-006 |
| [X] TC.17 | Pruebas Vitest + RTL de los componentes con lógica (formularios y listas con estado) | Cobertura de al menos 1 test de render + 1 de interacción por componente listado en TC.9–TC.14 | L | TC.9–TC.14 | `**/*.test.jsx` | — |
| [X] TC.18 | README del módulo: cómo arrancar con MSW, cómo se desactivará en `003-implantacion` | `frontend/README.md` revisado, incluye variable `VITE_API_BASE_URL` | S | TC.4 | `frontend/README.md` | — |
| [X] TC.19 | Excluir MSW y sus fixtures (credenciales simuladas) del build de producción: el mock solo arranca con `import.meta.env.MODE === 'development'` y sin `VITE_API_BASE_URL` | Prueba automatizada ejecuta `vite build` y falla si el bundle contiene código de `src/mocks/`, `mockServiceWorker` o la contraseña simulada | S | TC.4 | `src/main.jsx`, `tests/buildProduccion.test.js` | RNF-002, ADR-0002 |

> **TC.16 — estado parcial (2026-09-23):** el CSS mobile-first (breakpoints 480/768/1024px) está
> implementado en cada `*.module.css` y se verificó manualmente en un navegador real durante el
> desarrollo (login, las 9 HU, formularios de error) sin scroll horizontal ni solapes visibles.
> No se pudieron adjuntar capturas en los 3 breakpoints exactos porque la herramienta de
> automatización de navegador usada en esta sesión no propagó el resize de ventana al viewport de
> la pestaña (limitación de la herramienta, no del código). **Pendiente:** una pasada manual con
> capturas reales en 480/768/1024px antes de cerrar el PR — ver `frontend/README.md`.

## Cierre del módulo

Antes de abrir el PR de `feature/001-entorno-cliente` → `develop`:

- [x] Las 9 HU de `spec.md` ejecutables de principio a fin contra el mock (verificación manual en
      navegador real: login de los 4 roles, HU-01 a HU-09, incluidos los casos de error RF-002,
      RF-006 y RF-009).
- [x] `npm run build`, `npm run test` (54 pruebas), `npm run test:a11y` (12 páginas, 0
      violaciones críticas/serias) en verde.
- [x] Ninguna clase Tailwind fuera de `features/admin/**` (verificado por
      `eslint-plugin-tailwindcss` — `npm run lint` en verde — y comprobado a propósito: una clase
      Tailwind añadida temporalmente en `features/docente` no se compiló).
- [x] `docs/adr/0001-frontend-react-tailwind.md` sigue reflejando fielmente lo construido (React
      en todo el cliente, Tailwind solo en `features/admin/**`).
- [x] Access token nunca en `localStorage`/`sessionStorage` (diseño: `httpClient.js` lo guarda solo
      en una variable de módulo; `AuthContext.jsx` en estado de React); flujo de cookies/CSRF
      simulado fielmente según `docs/adr/0002-seguridad-sesion-y-datos.md` y verificado en
      navegador real: recarga de página recupera la sesión vía `/auth/refresh` sin pedir
      credenciales, logout revoca la sesión (TC.6, TC.7, TC.7b).
- [ ] TC.16 pendiente de cierre formal (ver nota arriba): capturas manuales en los 3 breakpoints.
