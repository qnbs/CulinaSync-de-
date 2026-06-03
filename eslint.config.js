import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'packages/**/dist/**',
      'apps/web/.storybook/**',
      'apps/web/e2e/**',
      'apps/web/playwright.config.ts',
    ],
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ai-core/**/*.ts'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: '19.1.1',
      },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooksPlugin.configs.flat['recommended-latest'].rules,
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': 'off',
      // QNBS-v3: Strikte Quality-Gates — CI/lint-staged nutzen --max-warnings 0
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Typed rules (no-floating-promises, …): Follow-up R-005 mit projectService — siehe docs/AUDIT-REMEDIATION-BACKLOG.md
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
    },
  },
);
