module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: [
    '@typescript-eslint',
    'playwright',
    'prettier'
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // General ESLint rules
    'no-console': 'off', // Allow console for test logging
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'max-len': ['warn', { code: 120, ignoreComments: true, ignoreStrings: true }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],

    // Playwright specific rules
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-element-handle': 'warn',
    'playwright/no-eval': 'error',
    'playwright/no-focused-test': 'error',
    'playwright/no-force-option': 'warn',
    'playwright/no-page-pause': 'warn',
    'playwright/no-restricted-matchers': 'off',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-useless-await': 'error',
    'playwright/no-wait-for-timeout': 'warn',
    'playwright/prefer-web-first-assertions': 'error',
    'playwright/valid-expect': 'error',

    // Prettier integration
    'prettier/prettier': 'error'
  },
  overrides: [
    {
      // Test files specific rules
      files: ['**/*.spec.ts', '**/*.test.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'max-len': 'off' // Allow longer lines in tests for readability
      }
    },
    {
      // Configuration files
      files: ['*.config.ts', '*.config.js', '.eslintrc.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off'
      }
    },
    {
      // Page Object files
      files: ['**/pages/**/*.ts', '**/page-objects/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off' // Page objects often use non-null assertions
      }
    },
    {
      // Fixture files
      files: ['**/fixtures/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off' // Fixtures may use any for flexibility
      }
    },
    {
      // API client files
      files: ['**/api/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn' // API responses may be any
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'test-results/',
    'allure-results/',
    'playwright-report/',
    '*.min.js',
    '*.bundle.js'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  }
};