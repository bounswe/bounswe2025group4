// eslint.config.js
// author: ismail tarik erkan
// date: 2025-05-01
// ESLint checks your code for potential errors and enforces best practices
// TypeScript rules ensure type safety
// React-specific rules help prevent common React and Hooks mistakes
// Prettier ensures consistent code formatting across the project
// The ignore files prevent formatting/linting of generated or third-party code

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import * as tseslint from 'typescript-eslint';

// Create compatibility layer for older ESLint configs
const compat = new FlatCompat();

// Export an array of configuration objects - ESLint will merge them in order
export default [
  // Include recommended JavaScript rules
  js.configs.recommended,
  // Spread TypeScript recommended configs
  ...tseslint.configs.recommended,
  // Convert traditional config format for React Hooks
  ...compat.config({
    extends: ['plugin:react-hooks/recommended'],
  }),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,  // Includes window, document, etc.
        ...globals.es2021,  // Includes Promise, Map, Set, etc.
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Warn about components that should be wrapped in React.memo()
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Allow constant exports without warning
      ],
      'no-unused-vars': 'warn',
      // Warn about console.log, but allow console.warn and console.error
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];