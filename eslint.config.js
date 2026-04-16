const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['apps/backend/src/**/*.ts'],
  })),
  {
    files: ['apps/backend/src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './apps/backend/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  prettier,
];
