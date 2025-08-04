module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'none',
  singleQuote: true,
  doubleQuote: false,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // Quote props
  quoteProps: 'as-needed',
  
  // JSX specific (if needed for React components in tests)
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
  
  // Vue files
  vueIndentScriptAndStyle: false,
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2
      }
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: ['*.spec.ts', '*.test.ts'],
      options: {
        printWidth: 120, // Allow longer lines in test files for readability
        tabWidth: 2
      }
    },
    {
      files: ['playwright.config.ts', '*.config.ts'],
      options: {
        printWidth: 120,
        tabWidth: 2
      }
    }
  ]
};