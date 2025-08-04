# Playwright Healthcare Framework Setup Guide

This guide will help you set up and resolve any dependency issues in the Playwright Healthcare Framework.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Navigate to the project directory
cd playwright-healthcare-framework

# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install system dependencies (Linux/macOS)
npx playwright install-deps
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Verify Installation

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run a simple test
npm run test:smoke
```

## 🔧 Resolving Common Issues

### TypeScript Errors

The framework shows TypeScript errors because dependencies aren't installed yet. After running `npm install`, these errors will be resolved:

**Common Error:**
```
Cannot find module '@playwright/test' or its corresponding type declarations.
```

**Solution:**
```bash
npm install @playwright/test@^1.40.0
```

### Missing Dependencies

If you encounter missing dependency errors, install them individually:

```bash
# Core dependencies
npm install @playwright/test@^1.40.0
npm install @azure/cosmos@^4.0.0
npm install axios@^1.5.0
npm install js-yaml@^4.1.0
npm install csv-parser@^3.0.0
npm install faker@^6.6.6
npm install moment@^2.29.4
npm install soap@^1.0.0
npm install xml2js@^0.6.2

# Development dependencies
npm install --save-dev @types/node@^20.8.0
npm install --save-dev @types/xml2js@^0.4.14
npm install --save-dev typescript@^5.2.2
npm install --save-dev eslint@^8.50.0
npm install --save-dev prettier@^3.0.3
npm install --save-dev allure-playwright@^2.8.0
```

### Database Configuration

For Cosmos DB integration:

```bash
# Set environment variables
export COSMOS_DB_ENDPOINT="your-cosmos-endpoint"
export COSMOS_DB_KEY="your-cosmos-key"
export COSMOS_DB_DATABASE="your-database-name"
export COSMOS_DB_CONTAINER="your-container-name"
```

For Oracle DB integration:

```bash
# Install Oracle client (if needed)
# Follow Oracle documentation for your OS

# Set environment variables
export ORACLE_DB_HOST="your-oracle-host"
export ORACLE_DB_PORT="1521"
export ORACLE_DB_SERVICE="your-service-name"
export ORACLE_DB_USERNAME="your-username"
export ORACLE_DB_PASSWORD="your-password"
```

## 📁 Project Structure Verification

After setup, your project structure should look like this:

```
playwright-healthcare-framework/
├── .env                           # Environment configuration
├── .env.example                   # Environment template
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc.js                 # Prettier configuration
├── package.json                   # Dependencies and scripts
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
├── global-setup.ts               # Global test setup
├── global-teardown.ts            # Global test cleanup
├── README.md                     # Main documentation
├── SETUP.md                      # This setup guide
├── .github/
│   └── workflows/
│       └── playwright-tests.yml  # CI/CD pipeline
├── src/
│   ├── api/                      # API testing utilities
│   ├── config/                   # Environment configurations
│   ├── data/                     # Test data management
│   ├── fixtures/                 # Test fixtures
│   ├── pages/                    # Page Object Model
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Utility functions
├── tests/
│   ├── api/                      # API test suites
│   ├── e2e/                      # End-to-end tests
│   ├── security/                 # Security tests
│   ├── accessibility/            # Accessibility tests
│   └── performance/              # Performance tests
└── test-data/                    # Static test data files
```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:smoke
npm run test:api
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug
```

### Browser-Specific Testing

```bash
# Run tests on specific browsers
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run mobile tests
npm run test:mobile
```

### Parallel Execution

```bash
# Run tests with custom worker count
npm run test:parallel

# Or specify workers directly
npx playwright test --workers=8
```

## 📊 Reporting

### Generate Reports

```bash
# View HTML report
npm run report

# Generate Allure report
npm run report:generate

# Serve Allure report
npm run report:allure
```

### View Test Results

After running tests, reports will be available in:
- `test-results/html-report/` - HTML report
- `allure-results/` - Allure raw results
- `allure-report/` - Generated Allure report

## 🔍 Troubleshooting

### Common Issues and Solutions

**Issue: "Cannot find module" errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: Playwright browsers not installed**
```bash
# Reinstall browsers
npx playwright install --force
```

**Issue: Permission errors on Linux/macOS**
```bash
# Install system dependencies
sudo npx playwright install-deps
```

**Issue: TypeScript compilation errors**
```bash
# Check TypeScript configuration
npm run type-check

# Fix common issues
npm run lint:fix
npm run format
```

**Issue: Database connection failures**
```bash
# Verify environment variables
echo $COSMOS_DB_ENDPOINT
echo $ORACLE_DB_HOST

# Test database connectivity
npm run test -- --grep "database"
```

### Environment-Specific Issues

**QA Environment:**
- Ensure VPN connection if required
- Verify test user credentials
- Check firewall settings

**UAT Environment:**
- Confirm environment URLs
- Validate SSL certificates
- Test API endpoints manually

**Production Environment:**
- Use read-only test accounts
- Limit test scope
- Monitor test impact

## 🔐 Security Considerations

### Credential Management

```bash
# Never commit real credentials
# Use environment variables or secure vaults

# Example secure setup
export MEMBER_USERNAME="test.member@uhc.com"
export MEMBER_PASSWORD="$(vault kv get -field=password secret/test-users/member)"
```

### HIPAA Compliance

- Ensure test data doesn't contain real PHI
- Use synthetic data generators
- Implement data masking in logs
- Regular security audits

## 🚀 CI/CD Integration

### GitHub Actions Setup

The framework includes a comprehensive GitHub Actions workflow. To use it:

1. Set up repository secrets:
   ```
   QA_BASE_URL
   QA_API_BASE_URL
   QA_MEMBER_USERNAME
   QA_MEMBER_PASSWORD
   COSMOS_DB_KEY
   SLACK_WEBHOOK_URL
   ```

2. Enable GitHub Pages for test reports

3. Configure branch protection rules

### Jenkins Setup

For Jenkins integration:

1. Install required plugins:
   - NodeJS Plugin
   - HTML Publisher Plugin
   - Allure Plugin

2. Configure pipeline using provided Jenkinsfile template

3. Set up environment variables in Jenkins

## 📞 Support

### Getting Help

1. **Check Documentation**: Review README.md and inline code comments
2. **Search Issues**: Look for similar problems in project issues
3. **Run Diagnostics**: Use built-in diagnostic commands
4. **Contact Team**: Reach out to the QA team for healthcare domain questions

### Diagnostic Commands

```bash
# Check system requirements
node --version
npm --version
npx playwright --version

# Verify configuration
npm run type-check
npm run lint

# Test basic functionality
npm run test -- --grep "login"
```

### Useful Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Healthcare Testing Best Practices](https://example.com/healthcare-testing)
- [HIPAA Compliance Guidelines](https://example.com/hipaa-compliance)

---

**Note**: This framework is designed for testing healthcare applications and includes specific compliance and security considerations. Always follow your organization's security policies and guidelines.