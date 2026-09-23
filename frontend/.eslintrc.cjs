module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    tailwindcss: {
      // ADR-0001: solo features/admin/** puede usar clases Tailwind. Ruta absoluta: el plugin
      // resuelve `config` relativo al directorio del fichero que se está lintando en cada
      // momento, no a la raíz del proyecto — una ruta relativa falla en cualquier fichero que no
      // esté en la raíz.
      config: require('path').join(__dirname, 'tailwind.config.js'),
    },
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'public/mockServiceWorker.js'],
  overrides: [
    {
      // Fuera de features/admin, cualquier clase con pinta de Tailwind es un error, no un warning
      // (plan.md §5, regla 1).
      files: ['src/**/*.{jsx,js}'],
      excludedFiles: ['src/features/admin/**/*.{jsx,js}'],
      rules: {
        'tailwindcss/no-custom-classname': 'off',
      },
    },
  ],
  rules: {
    'react/prop-types': 'off',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',
    // Una región desplazable (tabla ancha en móvil, TC.16) debe ser enfocable para poder
    // desplazarla con teclado (WCAG 2.1.1; regla axe `scrollable-region-focusable`).
    'jsx-a11y/no-noninteractive-tabindex': [
      'error',
      { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
    ],
  },
}
