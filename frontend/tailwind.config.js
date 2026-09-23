/** @type {import('tailwindcss').Config} */
export default {
  // ADR-0001 / plan.md §5: Tailwind se genera EXCLUSIVAMENTE para src/features/admin/**.
  // Una clase Tailwind escrita fuera de esa carpeta no se compila (fallo silencioso en build,
  // detectado además por eslint-plugin-tailwindcss). No amplíes este patrón sin justificarlo
  // en el PR (Principio 3 de la constitución).
  content: ['./src/features/admin/**/*.{jsx,js}'],
  theme: {
    extend: {},
  },
  // El reset "preflight" de Tailwind es global (no lo limita `content`) y chocaría con
  // src/styles/base.css, que ya es el reset compartido por todo el proyecto (docente/alumno/
  // público con CSS3 a mano). Se desactiva aquí para que Tailwind aporte solo utilidades
  // (scoped por `content` a features/admin/**) sin tocar el reset global.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
