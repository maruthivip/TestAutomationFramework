# Quick Start Guide - Playwright Healthcare Framework

Get up and running with the Playwright Healthcare Framework in 5 minutes!

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd playwright-healthcare-framework
npm install
npx playwright install
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials (minimum required)
nano .env
```

**Add these essential variables to `.env`:**
```bash
BASE_URL=https://qa.uhc-gps.com
MEMBER_USERNAME=your_member_username
MEMBER_PASSWORD=your_member_password
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

### Step 3: Run Your First Test
```bash
# Run smoke tests (fastest way to verify setup)
npm run test:smoke

# Or run a specific test file
npm test tests/e2e/member-login.spec.ts

# Run in headed mode to see the browser
npm run test:headed
```

## 🎯 Common Commands

### **Basic Test Execution**
```bash
# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode (interactive)
npm run test:ui
```

### **Role-Specific Testing**
```bash
# Test member functionality
npm run test:member

# Test admin functionality  
npm run test:admin

# Test API endpoints
npm run test:api
```

### **Environment Testing**
```bash
# Test against QA environment (default)
npm test

# Test against UAT environment
TEST_ENV=uat npm test

# Test against local development
TEST_ENV=local BASE_URL=http://localhost:3000 npm test
```

### **BDD Feature Testing** (After creating feature files)
```bash
# Run BDD tests
npm run test:bdd

# Run BDD smoke tests
npm run test:bdd:smoke

# Run specific BDD scenarios
npm run test:bdd:member
npm run test:bdd:claims
```

## 📊 View Results

```bash
# Open HTML report
npm run test:report

# Generate Allure report
npm run test:allure
```

## 🔧 Available Test Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:smoke` | Run smoke tests only |
| `npm run test:regression` | Run regression tests |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:ui` | Interactive test runner |
| `npm run test:member` | Run member-related tests |
| `npm run test:admin` | Run admin-related tests |
| `npm run test:api` | Run API tests |
| `npm run test:bdd` | Run BDD feature tests |
| `npm run test:report` | View HTML test report |
| `npm run test:allure` | Generate Allure report |

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Cannot find module" error:**
   ```bash
   npm install
   npx playwright install
   ```

2. **Authentication failures:**
   - Check `.env` file has correct credentials
   - Verify URLs are accessible

3. **Browser not launching:**
   ```bash
   npx playwright install chromium
   ```

4. **Tests timing out:**
   ```bash
   TEST_TIMEOUT=180000 npm test
   ```

### **Verify Setup:**
```bash
# Check Playwright version
npx playwright --version

# List available tests
npx playwright test --list

# Check configuration
npx playwright test --reporter=list --dry-run
```

## 📁 Project Structure

```
playwright-healthcare-framework/
├── 📁 tests/
│   ├── 📁 e2e/           # End-to-end tests ✅
│   ├── 📁 api/           # API tests ✅
│   └── 📁 bdd/           # BDD scenarios ✅
├── 📁 src/
│   ├── 📁 pages/         # Page Object Model ✅
│   ├── 📁 fixtures/      # Test fixtures ✅
│   ├── 📁 utils/         # Utilities ✅
│   └── 📁 config/        # Configuration ✅
├── 📄 .env               # Environment variables
├── 📄 playwright.config.ts # Main configuration
└── 📄 package.json       # Dependencies & scripts
```

## 🎯 Next Steps

1. **Customize Configuration:**
   - Update `.env` with your actual credentials
   - Modify `src/config/environments.ts` for your environments

2. **Add Your Tests:**
   - Create new test files in `tests/e2e/`
   - Add BDD scenarios in `tests/bdd/`

3. **Extend Framework:**
   - Add new page objects in `src/pages/`
   - Create custom utilities in `src/utils/`

4. **Set Up CI/CD:**
   - Use provided GitHub Actions workflow
   - Configure Jenkins pipeline

## 📚 Documentation

- **[Complete Setup Guide](CONFIGURATION-GUIDE.md)** - Detailed configuration instructions
- **[How to Run Guide](HOW-TO-RUN-GUIDE.md)** - Comprehensive execution guide
- **[BDD Testing Guide](BDD-TESTING-GUIDE.md)** - BDD scenarios and best practices
- **[Setup Instructions](../SETUP.md)** - Installation and troubleshooting

---

**Ready to start testing!** 🚀

Run `npm run test:smoke` to verify your setup is working correctly.