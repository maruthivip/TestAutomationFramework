import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
    ['github']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://qa.yourprojecthost',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for each action */
    actionTimeout: 30000,
    
    /* Global timeout for navigation */
    navigationTimeout: 60000,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Accept downloads */
    acceptDownloads: true,
    
    /* Locale */
    locale: 'en-US',
    
    /* Timezone */
    timezoneId: 'America/New_York',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Test-Automation-Framework/1.0'
    }
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
      dependencies: ['setup']
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      },
      dependencies: ['setup']
    },

    // Tablet browsers
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro']
      },
      dependencies: ['setup']
    },

    // API testing project
    {
      name: 'api-tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.yourprojecthost'
      }
    },

    // Accessibility testing project
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup']
    },

    // Performance testing project
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup']
    },

    // Security testing project
    {
      name: 'security',
      testMatch: /.*\.security\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup']
    }
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Configure test timeout */
  timeout: 120000,

  /* Configure expect timeout */
  expect: {
    timeout: 10000,
    toHaveScreenshot: { 
      threshold: 0.2,
    },
    toMatchSnapshot: { 
      threshold: 0.2 
    }
  },

  /* Run your local dev server before starting the tests */
  webServer: process.env.START_LOCAL_SERVER === 'true' ? {
    command: 'npm run start:test',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  } : undefined,

  /* Test metadata */
  metadata: {
    'test-suite': 'Test Automation Framework',
    'environment': process.env.TEST_ENV || 'qa',
    'version': '1.0.0',
    'author': 'Healthcare QA Team'
  }
});