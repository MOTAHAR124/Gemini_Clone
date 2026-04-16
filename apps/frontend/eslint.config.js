const nextVitals = require('eslint-config-next/core-web-vitals');

module.exports = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts', '*.tsbuildinfo'],
  },
];
