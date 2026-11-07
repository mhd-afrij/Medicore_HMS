import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules', 'backend', '.venv', '.eslintrc.cjs'] },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: { window: 'readonly', URLSearchParams: 'readonly' },
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      // Keep the v5 recommended severities so the existing codebase isn't re-linted
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // New in ESLint 9; requires Error cause (ES2022) to satisfy
      'preserve-caught-error': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
