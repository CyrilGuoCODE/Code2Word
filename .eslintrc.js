module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: [
    'node'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error'
  },
  overrides: [
    {
      files: ['src/main/**/*.js'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['src/renderer/**/*.js'],
      env: {
        browser: true,
        node: false
      },
      globals: {
        electronAPI: 'readonly',
        pathAPI: 'readonly',
        osAPI: 'readonly'
      }
    },
    {
      files: ['src/preload/**/*.js'],
      env: {
        node: true,
        browser: false
      }
    }
  ]
};