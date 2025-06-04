module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Add prettier last to override other formatting rules
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'], // .eslintrc.cjs is Vite's default
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn' // Example: relax a rule
  },
};
