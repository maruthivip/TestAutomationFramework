# How to Run the Playwright Healthcare Framework

This guide provides step-by-step instructions on how to set up, configure, and run the Playwright Healthcare Framework with BDD feature files.

## 🚀 Quick Start

### 1. **Initial Setup**

```bash
# Navigate to the project directory
cd playwright-healthcare-framework

# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment configuration
cp .env.example .env
```

### 2. **Configure Environment Variables**

Edit the `.env` file with your actual credentials and URLs:

```bash
# Open .env file in your editor
nano .env
# or
code .env
```

**Minimum required configuration:**
```bash
# Application URLs
BASE_URL=https://qa.uhc-gps.com
API_BASE_URL=https://api-qa.uhc-gps.com

# Test User Credentials (replace with actual credentials)
MEMBER_USERNAME=john.member@uhc.com
MEMBER_PASSWORD=TestPassword123!

ADMIN_USERNAME=admin.user@uhc.com
ADMIN_PASSWORD=AdminPassword123!

# OAuth2 Configuration
OAUTH2_CLIENT_ID=your_client_id_here
OAUTH2_CLIENT_SECRET=your_client_secret_here
```

## 🧪 Running Tests

### **Option 1: Standard Playwright Tests (Recommended for Development)**

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npm test tests/e2e/member-login.spec.ts

# Run tests with specific tag
npm test -- --grep "@smoke"

# Run tests in debug mode
npm run test:debug

# Run tests against specific environment
TEST_ENV=uat npm test

# Run tests with specific browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

### **Option 2: BDD Feature Files (Cucumber Integration)**

**Note:** For BDD tests, you'll need to install Cucumber dependencies first:

```bash
# Install Cucumber dependencies
npm install --save-dev @cucumber/cucumber @cucumber/html-formatter cucumber-html-reporter

# Create feature files directory
mkdir -p tests/features

# Run BDD tests (after creating feature files)
npx cucumber-js

# Run with specific tags
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@member and @authentication"

# Run in parallel
npx cucumber-js --parallel 4

# Run with custom format
npx cucumber-js --format progress-bar --format json:test-results/cucumber-report.json
```

### **Option 3: Using Package.json Scripts**

Add these scripts to your [`package.json`](package.json:1):

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:member": "playwright test tests/e2e/member-*.spec.ts",
    "test:api": "playwright test tests/api/",
    "test:bdd": "cucumber-js",
    "test:bdd:smoke": "cucumber-js --tags '@smoke'",
    "test:bdd:member": "cucumber-js --tags '@member'",
    "test:bdd:claims": "cucumber-js --tags '@claims'",
    "test:bdd:parallel": "cucumber-js --parallel 4",
    "test:bdd:headed": "HEADLESS=false cucumber-js",
    "test:report": "playwright show-report",
    "test:allure": "allure serve allure-results"
  }
}
```

Then run:

```bash
# Standard Playwright tests
npm run test:smoke
npm run test:member
npm run test:headed

# BDD tests (after setup)
npm run test:bdd:smoke
npm run test:bdd:member
npm run test:bdd:parallel
```

## 📁 Project Structure for Running Tests

```
playwright-healthcare-framework/
├── 📁 tests/
│   ├── 📁 e2e/                 # ✅ Ready to run
│   │   ├── member-login.spec.ts
│   │   ├── claims-*.spec.ts
│   │   └── api-*.spec.ts
│   ├── 📁 bdd/                 # ✅ Ready to run
│   │   ├── member-authentication.spec.ts
│   │   ├── claims-processing.spec.ts
│   │   └── eligibility-verification.spec.ts
│   └── 📁 features/            # 📋 Create for Cucumber
│       ├── member-authentication.feature
│       ├── claims-processing.feature
│       └── eligibility-verification.feature
├── 📁 src/fixtures/step-definitions/  # 🔧 For Cucumber
│   ├── world.ts                # ✅ Created
│   ├── authentication-steps.ts
│   └── claims-steps.ts
└── 📄 cucumber.config.js       # ⚙️ Cucumber configuration
```

## 🎯 Running Specific Test Scenarios

### **1. Member Authentication Tests**

```bash
# Run member login tests
npm test tests/e2e/member-login.spec.ts

# Run BDD member authentication
npm test tests/bdd/member-authentication.spec.ts

# Run with specific user role
MEMBER_USERNAME=test@uhc.com MEMBER_PASSWORD=pass123 npm test
```

### **2. Claims Processing Tests**

```bash
# Run claims tests
npm test tests/bdd/claims-processing.spec.ts

# Run with claims processor role
npm test -- --grep "claims processor"
```

### **3. API Integration Tests**

```bash
# Run API tests
npm test tests/api/

# Run REST API tests only
npm test -- --grep "REST API"

# Run SOAP API tests only
npm test -- --grep "SOAP API"
```

### **4. Multi-Role Testing**

```bash
# Run tests for all healthcare roles
npm test -- --grep "@member or @admin or @provider"

# Run workflow tests
npm test -- --grep "@workflow"
```

## 🌍 Environment-Specific Execution

### **QA Environment (Default)**
```bash
TEST_ENV=qa npm test
# or
export TEST_ENV=qa
npm test
```

### **UAT Environment**
```bash
TEST_ENV=uat npm test
```

### **Production Environment**
```bash
TEST_ENV=prod npm test
```

### **Local Development**
```bash
TEST_ENV=local BASE_URL=http://localhost:3000 npm test
```

## 🔧 Advanced Execution Options

### **Parallel Execution**
```bash
# Run tests in parallel (default: 4 workers)
npm test

# Custom worker count
npm test -- --workers=8

# Disable parallel execution
npm test -- --workers=1
```

### **Browser-Specific Execution**
```bash
# Run on specific browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit

# Run on all browsers
npm test -- --project=chromium --project=firefox --project=webkit
```

### **Debugging and Development**
```bash
# Debug mode (opens browser dev tools)
npm run test:debug

# UI mode (interactive test runner)
npm run test:ui

# Headed mode (see browser actions)
npm run test:headed

# Slow motion (for debugging)
SLOW_MO=1000 npm test
```

### **Retry and Timeout Configuration**
```bash
# Custom retry count
npm test -- --retries=3

# Custom timeout
TEST_TIMEOUT=180000 npm test

# Custom action timeout
ACTION_TIMEOUT=45000 npm test
```

## 📊 Viewing Test Results

### **HTML Report**
```bash
# Generate and view HTML report
npm run test:report
```

### **Allure Report**
```bash
# Generate Allure report
npm run test:allure
```

### **Console Output**
```bash
# Verbose output
npm test -- --reporter=list

# JSON output
npm test -- --reporter=json

# JUnit output
npm test -- --reporter=junit
```

## 🐛 Troubleshooting

### **Common Issues and Solutions**

1. **"Cannot find module" errors:**
   ```bash
   npm install
   npx playwright install
   ```

2. **Authentication failures:**
   ```bash
   # Check .env file has correct credentials
   cat .env | grep USERNAME
   ```

3. **Browser not found:**
   ```bash
   npx playwright install chromium
   ```

4. **Port conflicts:**
   ```bash
   # Use different port
   BASE_URL=http://localhost:3001 npm test
   ```

5. **Timeout issues:**
   ```bash
   # Increase timeout
   TEST_TIMEOUT=300000 npm test
   ```

### **Debug Commands**
```bash
# Check Playwright installation
npx playwright --version

# List available browsers
npx playwright install --dry-run

# Check test files
npx playwright test --list

# Validate configuration
npx playwright test --reporter=list --dry-run
```

## 📋 Pre-Run Checklist

Before running tests, ensure:

- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Application URLs are accessible
- [ ] Test credentials are valid
- [ ] Database connections configured (if using real data)

## 🚀 CI/CD Execution

### **GitHub Actions**
```yaml
# Already configured in .github/workflows/playwright-tests.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
```

### **Jenkins**
```bash
# Jenkins pipeline commands
npm ci
npx playwright install --with-deps
npm test
```

This guide provides comprehensive instructions for running the Playwright Healthcare Framework in various configurations and environments.