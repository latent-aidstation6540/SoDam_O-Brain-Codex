export default [
  {
    ignores: ['**/node_modules/**', '**/data/**', '**/test-results/**', '**/playwright-report/**']
  },
  {
    files: ['app/src/**/*.mjs', 'app/e2e/**/*.mjs', 'plugins/o-brain/hooks/**/*.mjs', 'plugins/o-brain/scripts/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        AbortSignal: 'readonly', Buffer: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
        clearInterval: 'readonly', clearTimeout: 'readonly', console: 'readonly', fetch: 'readonly',
        process: 'readonly', setInterval: 'readonly', setTimeout: 'readonly', structuredClone: 'readonly'
      }
    },
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-loss-of-precision': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-obj-calls': 'error',
      'no-promise-executor-return': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error'
    }
  },
  {
    files: ['app/e2e/**/*.mjs'],
    languageOptions: { globals: { document: 'readonly', window: 'readonly' } }
  }
];

