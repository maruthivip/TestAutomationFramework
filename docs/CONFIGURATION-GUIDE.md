# Configuration Guide - Step Definitions, Features, URLs, Credentials & Settings

This comprehensive guide explains exactly where and how to configure all aspects of the Playwright Healthcare Framework, including step definitions, feature files, URLs, credentials, and other settings.

## 📁 Project Structure Overview

```
playwright-healthcare-framework/
├── 📁 src/
│   ├── 📁 config/           # ⚙️ Environment configurations
│   ├── 📁 fixtures/         # 🔧 Test fixtures and step definitions
│   ├── 📁 pages/           # 📄 Page Object Model classes
│   ├── 📁 api/             # 🌐 API clients and utilities
│   ├── 📁 utils/           # 🛠️ Helper utilities
│   ├── 📁 data/            # 📊 Test data management
│   └── 📁 types/           # 📝 TypeScript definitions
├── 📁 tests/
│   ├── 📁 bdd/             # 🧪 BDD test scenarios
│   ├── 📁 e2e/             # 🔄 End-to-end tests
│   ├── 📁 api/             # 🌐 API tests
│   └── 📁 features/        # 📋 Gherkin feature files
├── 📁 test-data/           # 📊 Static test data files
├── 📁 docs/                # 📚 Documentation
├── 📄 .env                 # 🔐 Environment variables
├── 📄 .env.example         # 📋 Environment template
└── 📄 playwright.config.ts # ⚙️ Main configuration
```

## 🔐 1. Environment Variables & Credentials

### **Primary Configuration File: `.env`**

**Location:** `playwright-healthcare-framework/.env`

```bash
# Copy from template and customize
cp .env.example .env
```

**Complete `.env` Configuration:**

```bash
# ==========================================
# ENVIRONMENT CONFIGURATION
# ==========================================
TEST_ENV=qa
NODE_ENV=test

# ==========================================
# APPLICATION URLs
# ==========================================
# QA Environment
BASE_URL=https://qa.uhc-gps.com
API_BASE_URL=https://api-qa.uhc-gps.com
SOAP_BASE_URL=https://soap-qa.uhc-gps.com

# UAT Environment (uncomment when testing UAT)
# BASE_URL=https://uat.uhc-gps.com
# API_BASE_URL=https://api-uat.uhc-gps.com
# SOAP_BASE_URL=https://soap-uat.uhc-gps.com

# Production Environment (uncomment when testing PROD)
# BASE_URL=https://uhc-gps.com
# API_BASE_URL=https://api.uhc-gps.com
# SOAP_BASE_URL=https://soap.uhc-gps.com

# ==========================================
# AUTHENTICATION CREDENTIALS
# ==========================================
# OAuth2 Configuration
OAUTH2_CLIENT_ID=your_client_id_here
OAUTH2_CLIENT_SECRET=your_client_secret_here
OAUTH2_TOKEN_URL=https://auth-qa.uhc-gps.com/oauth2/token
OAUTH2_SCOPE=read write

# ==========================================
# USER CREDENTIALS BY ROLE
# ==========================================
# Member Credentials
MEMBER_USERNAME=john.member@uhc.com
MEMBER_PASSWORD=TestPassword123!

# Employee Credentials
EMPLOYEE_USERNAME=jane.employee@uhc.com
EMPLOYEE_PASSWORD=TestPassword123!

# Administrator Credentials
ADMIN_USERNAME=admin.user@uhc.com
ADMIN_PASSWORD=AdminPassword123!

# Broker Credentials
BROKER_USERNAME=bob.broker@uhc.com
BROKER_PASSWORD=BrokerPassword123!

# Claims Processor Credentials
CLAIMS_PROCESSOR_USERNAME=carol.claims@uhc.com
CLAIMS_PROCESSOR_PASSWORD=ClaimsPassword123!

# Customer Service Credentials
CUSTOMER_SERVICE_USERNAME=david.service@uhc.com
CUSTOMER_SERVICE_PASSWORD=ServicePassword123!

# Healthcare Provider Credentials
PROVIDER_USERNAME=dr.emily.provider@uhc.com
PROVIDER_PASSWORD=ProviderPassword123!

# Finance Team Credentials
FINANCE_USERNAME=frank.finance@uhc.com
FINANCE_PASSWORD=FinancePassword123!

# Compliance Officer Credentials
COMPLIANCE_USERNAME=grace.compliance@uhc.com
COMPLIANCE_PASSWORD=CompliancePassword123!

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# Cosmos DB Settings
COSMOS_DB_ENDPOINT=https://uhc-gps-qa.documents.azure.com:443/
COSMOS_DB_KEY=your_cosmos_db_primary_key_here
COSMOS_DB_DATABASE=uhc_gps_qa
COSMOS_DB_CONTAINER=test_data

# Oracle DB Settings
ORACLE_DB_HOST=oracle-qa.uhc.com
ORACLE_DB_PORT=1521
ORACLE_DB_SERVICE=UHCGPS
ORACLE_DB_USERNAME=test_user
ORACLE_DB_PASSWORD=test_password

# ==========================================
# TEST CONFIGURATION
# ==========================================
PARALLEL_WORKERS=4
TEST_TIMEOUT=120000
ACTION_TIMEOUT=30000
NAVIGATION_TIMEOUT=60000

# ==========================================
# FEATURE FLAGS
# ==========================================
ENABLE_SECURITY_TESTS=true
ENABLE_ACCESSIBILITY_TESTS=true
ENABLE_PERFORMANCE_TESTS=true
ENABLE_DATABASE_TESTS=false
HIPAA_COMPLIANCE_MODE=true

# ==========================================
# REPORTING CONFIGURATION
# ==========================================
ALLURE_RESULTS_DIR=allure-results
HTML_REPORT_DIR=test-results/html-report
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
TRACE_ON_FAILURE=true

# ==========================================
# CI/CD CONFIGURATION
# ==========================================
CI=false
HEADLESS=true
START_LOCAL_SERVER=false

# ==========================================
# LOGGING CONFIGURATION
# ==========================================
LOG_LEVEL=info
LOG_FILE=logs/test-execution.log
```

## ⚙️ 2. Environment-Specific Configurations

### **Location:** `src/config/environments.ts`

**How to Add New Environments:**

```typescript
// Add new environment configuration
export const environments: Record<string, Environment> = {
  // Existing environments...
  
  // Add new staging environment
  staging: {
    name: 'Staging',
    baseUrl: 'https://staging.uhc-gps.com',
    apiBaseUrl: 'https://api-staging.uhc-gps.com',
    soapBaseUrl: 'https://soap-staging.uhc-gps.com',
    database: {
      cosmosDb: {
        endpoint: 'https://uhc-gps-staging.documents.azure.com:443/',
        database: 'uhc_gps_staging',
        container: 'test_data'
      },
      oracleDb: {
        host: 'oracle-staging.uhc.com',
        port: 1521,
        service: 'UHCGPS'
      }
    },
    auth: {
      oauth2: {
        tokenUrl: 'https://auth-staging.uhc-gps.com/oauth2/token',
        clientId: process.env.OAUTH2_CLIENT_ID || '',
        scope: 'read write'
      }
    },
    features: {
      enableSecurityTests: true,
      enableAccessibilityTests: true,
      enablePerformanceTests: true,
      hipaaComplianceMode: true
    },
    performance: {
      budgetLoadTime: 3500,
      budgetFCP: 1700,
      budgetLCP: 2800
    }
  }
};
```

**How to Switch Environments:**

```bash
# Method 1: Environment variable
export TEST_ENV=staging
npm test

# Method 2: Command line
TEST_ENV=staging npm test

# Method 3: In .env file
TEST_ENV=staging
```

## 🧪 3. Step Definitions & BDD Configuration

### **Step Definitions Location:** `src/fixtures/step-definitions/`

**Create Step Definitions Directory:**

```bash
mkdir -p src/fixtures/step-definitions
```

**Example Step Definition File:** `src/fixtures/step-definitions/authentication-steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '@/pages/LoginPage';
import { UserRole } from '@/types/healthcare.types';

// Authentication Step Definitions
Given('I am on the login page', async function() {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.goto();
  await expect(this.page.locator('[data-testid="login-form"]')).toBeVisible();
});

Given('I am logged in as a {string}', async function(userRole: string) {
  const role = userRole.toLowerCase().replace(' ', '_') as UserRole;
  this.currentPage = await this.authenticateAs(role);
});

When('I enter valid {string} credentials', async function(userType: string) {
  const credentials = this.getCredentialsForUserType(userType);
  await this.loginPage.fillElement('usernameInput', credentials.username);
  await this.loginPage.fillElement('passwordInput', credentials.password);
  await this.loginPage.selectRole(credentials.role);
});

When('I click the login button', async function() {
  await this.loginPage.clickElement('loginButton');
});

Then('I should be redirected to the {string}', async function(expectedPage: string) {
  await this.page.waitForURL(url => !url.includes('/login'));
  expect(this.page.url()).toContain(`/${expectedPage.toLowerCase()}`);
});

Then('I should see my {string} welcome message', async function(userType: string) {
  const user = this.getCurrentUser();
  await expect(this.page.locator('[data-testid="welcome-message"]')).toContainText(user.firstName);
});
```

**Claims Processing Step Definitions:** `src/fixtures/step-definitions/claims-steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HealthcareDataGenerator } from '@/utils/HealthcareDataGenerator';

Given('I have valid insurance coverage', async function() {
  this.mockingUtils = createNetworkMockingUtils(this.page);
  await this.mockingUtils.mockEligibilityAPI(this.currentUser.memberId, true);
});

When('I navigate to the claims submission page', async function() {
  await this.page.goto('/claims/submit');
  await expect(this.page.locator('[data-testid="claims-form"]')).toBeVisible();
});

When('I fill in the claim details', async function() {
  this.claimData = HealthcareDataGenerator.generateClaim(
    this.currentUser.memberId, 
    'PRV123456'
  );
  
  await this.page.fill('[data-testid="provider-id"]', this.claimData.providerId);
  await this.page.fill('[data-testid="service-date"]', 
    this.claimData.serviceDate.toISOString().split('T')[0]);
  await this.page.fill('[data-testid="diagnosis-code"]', 'Z00.00');
  await this.page.fill('[data-testid="procedure-code"]', '99213');
  await this.page.fill('[data-testid="billed-amount"]', '150.00');
});

When('I submit the claim', async function() {
  await this.mockingUtils.mockClaimsAPI(this.claimData.claimId, 'approved');
  await this.page.click('[data-testid="submit-claim-button"]');
});

Then('I should see a success confirmation', async function() {
  await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(this.page.locator('[data-testid="success-message"]'))
    .toContainText('Claim submitted successfully');
});

Then('I should receive a claim confirmation number', async function() {
  const confirmationNumber = await this.page.locator('[data-testid="confirmation-number"]').textContent();
  expect(confirmationNumber).toMatch(/CLM\d{8}/);
  this.confirmationNumber = confirmationNumber;
});
```

### **World Configuration:** `src/fixtures/step-definitions/world.ts`

```typescript
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '@/pages/LoginPage';
import { UserRole, User } from '@/types/healthcare.types';
import { AuthHelper } from '@/fixtures/auth.fixtures';

export class HealthcareWorld extends World {
  public page!: Page;
  public context!: BrowserContext;
  public loginPage!: LoginPage;
  public currentUser!: User;
  public currentPage!: Page;
  public claimData: any;
  public confirmationNumber: string | null = null;
  public mockingUtils: any;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async authenticateAs(role: UserRole): Promise<Page> {
    // Implementation for authentication
    this.currentUser = AuthHelper.getUserForRole(role);
    // Return authenticated page
    return this.page;
  }

  getCredentialsForUserType(userType: string) {
    const roleMap: Record<string, UserRole> = {
      'member': UserRole.MEMBER,
      'employee': UserRole.EMPLOYEE,
      'administrator': UserRole.ADMINISTRATOR,
      'broker': UserRole.BROKER,
      'claims processor': UserRole.CLAIMS_PROCESSOR,
      'customer service': UserRole.CUSTOMER_SERVICE,
      'healthcare provider': UserRole.HEALTHCARE_PROVIDER,
      'finance team': UserRole.FINANCE_TEAM,
      'compliance officer': UserRole.COMPLIANCE_OFFICER
    };

    const role = roleMap[userType.toLowerCase()];
    return AuthHelper.getCredentialsForRole(role);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }
}

setWorldConstructor(HealthcareWorld);
```

## 📋 4. Feature Files Configuration

### **Feature Files Location:** `tests/features/`

**Create Features Directory:**

```bash
mkdir -p tests/features
```

**Example Feature File:** `tests/features/member-authentication.feature`

```gherkin
@authentication @smoke
Feature: Member Authentication
  As a UnitedHealth Care member
  I want to log into the GPS system
  So that I can access my healthcare information

  Background:
    Given I am on the login page

  @positive @critical
  Scenario: Successful member login with valid credentials
    When I enter valid "member" credentials
    And I click the login button
    Then I should be redirected to the "dashboard"
    And I should see my "member" welcome message

  @negative
  Scenario: Failed login with invalid credentials
    When I enter invalid credentials
      | username | invalid@uhc.com |
      | password | wrongpassword   |
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @validation
  Scenario: Login form validation for empty fields
    When I attempt to login without entering credentials
    Then the form should show validation errors
    And the login button should be disabled

  @security @hipaa
  Scenario: HIPAA privacy notice is displayed
    Then I should see the HIPAA privacy notice
    And I should see the accessibility compliance link

  @mfa
  Scenario: Multi-factor authentication when required
    Given I have an account with MFA enabled
    When I enter valid "member" credentials
    And I click the login button
    And MFA is required for my account
    Then I should see the MFA code input field
    When I enter a valid MFA code "123456"
    Then I should be successfully authenticated
```

**Claims Processing Feature:** `tests/features/claims-processing.feature`

```gherkin
@claims @core-functionality
Feature: Claims Processing
  As a healthcare system user
  I want to process medical claims
  So that members receive proper coverage and reimbursement

  Background:
    Given the system is configured for claims processing

  @member @submission @positive
  Scenario: Member submits a new medical claim successfully
    Given I am logged in as a "member"
    And I have valid insurance coverage
    When I navigate to the claims submission page
    And I fill in the claim details
      | provider_id    | PRV123456           |
      | service_date   | 2024-01-15          |
      | diagnosis_code | Z00.00              |
      | procedure_code | 99213               |
      | billed_amount  | 150.00              |
    And I submit the claim
    Then I should see a success confirmation
    And I should receive a claim confirmation number

  @claims-processor @review @workflow
  Scenario: Claims processor reviews and approves a submitted claim
    Given I am logged in as a "claims processor"
    And there is a pending claim in the system
    When I navigate to the claims review queue
    And I select the pending claim
    And I review the claim details
    When I approve the claim
    Then the claim status should be updated to "approved"
    And the member should be notified of the approval

  @claims-processor @denial @workflow
  Scenario: Claims processor denies a claim due to invalid diagnosis
    Given I am logged in as a "claims processor"
    And there is a claim with invalid diagnosis code
    When I navigate to the claims review queue
    And I select the invalid claim
    And I review the claim and find issues
    When I deny the claim with reason "INVALID_DIAGNOSIS"
    And I add denial comments "Diagnosis code not supported for this procedure"
    Then the claim status should be updated to "denied"
    And the denial reason should be recorded
    And the member should be notified with appeal information

  @member @status-check
  Scenario: Member checks claim status and payment details
    Given I am logged in as a "member"
    And I have previously submitted claims
    When I navigate to my claims history
    And I search for a specific claim
    Then I should see the claim details
    When I click on the claim to view details
    Then I should see the payment breakdown
    And I should see the explanation of benefits
```

**Eligibility Verification Feature:** `tests/features/eligibility-verification.feature`

```gherkin
@eligibility @verification
Feature: Eligibility Verification
  As a healthcare provider or member
  I want to verify insurance eligibility
  So that I can confirm coverage before providing services

  @provider @real-time
  Scenario: Provider verifies patient eligibility for covered services
    Given I am logged in as a "healthcare provider"
    And I have a patient who needs service verification
    When I navigate to the eligibility verification page
    And I enter the patient's member ID "MBR123456789"
    And I enter my provider ID "PRV123456"
    And I select the service date "2024-01-15"
    And I select the service type "Medical"
    When I submit the eligibility verification request
    Then I should see the eligibility confirmation "Eligible"
    And I should see the patient's benefit details
      | deductible_remaining | $500.00  |
      | copay_amount        | $25.00   |
      | out_of_pocket_max   | $5000.00 |
    And I should see coverage limitations if any

  @member @self-service
  Scenario: Member checks their own eligibility and benefits online
    Given I am logged in as a "member"
    When I navigate to my benefits and eligibility page
    Then I should see my current plan information
    And I should see my deductible information
    And I should see my out-of-pocket maximum details
    When I check specific service coverage for "Specialist Visit"
    Then I should see the coverage details
      | specialist_copay      | $50.00 |
      | coverage_percentage   | 80%    |

  @provider @negative
  Scenario: Eligibility verification fails for terminated member
    Given I am logged in as a "healthcare provider"
    And I have a patient whose coverage has been terminated
    When I navigate to the eligibility verification page
    And I enter the terminated patient's member ID "MBR999999999"
    And I submit the eligibility verification request
    Then I should see that the patient is "Not Eligible"
    And I should see the termination date
    And I should see a message about coverage termination
    And I should not see benefit details
```

## 🔧 5. Cucumber Configuration

### **Cucumber Configuration:** `cucumber.config.js`

```javascript
const config = {
  // Feature files location
  features: ['tests/features/**/*.feature'],
  
  // Step definitions location
  glue: ['src/fixtures/step-definitions/**/*.ts'],
  
  // World configuration
  worldParameters: {
    baseUrl: process.env.BASE_URL || 'https://qa.uhc-gps.com',
    apiBaseUrl: process.env.API_BASE_URL || 'https://api-qa.uhc-gps.com',
    timeout: parseInt(process.env.TEST_TIMEOUT || '120000'),
    headless: process.env.HEADLESS === 'true'
  },
  
  // Formatters and reporting
  format: [
    'progress-bar',
    'json:test-results/cucumber-report.json',
    'html:test-results/cucumber-report.html',
    'allure-cucumber-js:allure-results'
  ],
  
  // Tags configuration
  tags: process.env.CUCUMBER_TAGS || '@smoke or @critical',
  
  // Parallel execution
  parallel: parseInt(process.env.PARALLEL_WORKERS || '4'),
  
  // Retry configuration
  retry: parseInt(process.env.TEST_RETRIES || '1'),
  
  // Timeout settings
  timeout: parseInt(process.env.STEP_TIMEOUT || '30000'),
  
  // Hooks
  require: [
    'src/fixtures/step-definitions/hooks.ts',
    'src/fixtures/step-definitions/world.ts'
  ]
};

module.exports = config;
```

### **Hooks Configuration:** `src/fixtures/step-definitions/hooks.ts`

```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { HealthcareWorld } from './world';

let browser: Browser;

BeforeAll(async function() {
  // Initialize browser
  browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0')
  });
});

Before(async function(this: HealthcareWorld) {
  // Create new context and page for each scenario
  this.context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    acceptDownloads: true
  });
  
  this.page = await this.context.newPage();
  
  // Set up authentication helpers
  this.authenticateAs = async (role) => {
    // Implementation for role-based authentication
    return this.page;
  };
});

After(async function(this: HealthcareWorld, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page.screenshot({
      path: `test-results/screenshots/${scenario.pickle.name}-${Date.now()}.png`,
      fullPage: true
    });
    this.attach(screenshot, 'image/png');
  }
  
  // Close context
  await this.context.close();
});

AfterAll(async function() {
  // Close browser
  await browser.close();
});
```

## 📊 6. Test Data Configuration

### **Static Test Data Location:** `test-data/`

**User Credentials:** `test-data/users.json`

```json
{
  "users": {
    "member": {
      "username": "john.member@uhc.com",
      "password": "TestPassword123!",
      "memberId": "MBR123456789",
      "firstName": "John",
      "lastName": "Member"
    },
    "employee": {
      "username": "jane.employee@uhc.com",
      "password": "TestPassword123!",
      "employeeId": "EMP123456",
      "firstName": "Jane",
      "lastName": "Employee"
    },
    "admin": {
      "username": "admin.user@uhc.com",
      "password": "AdminPassword123!",
      "employeeId": "ADM123456",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

**Test Scenarios Data:** `test-data/scenarios/`

```bash
mkdir -p test-data/scenarios
```

**Claims Test Data:** `test-data/scenarios/claims-data.json`

```json
{
  "validClaim": {
    "memberId": "MBR123456789",
    "providerId": "PRV123456",
    "serviceDate": "2024-01-15",
    "diagnosisCode": "Z00.00",
    "procedureCode": "99213",
    "billedAmount": 150.00
  },
  "invalidClaim": {
    "memberId": "MBR999999999",
    "providerId": "PRV999999",
    "serviceDate": "2024-01-15",
    "diagnosisCode": "INVALID",
    "procedureCode": "99999",
    "billedAmount": -100.00
  }
}
```

## 🚀 7. Running BDD Tests

### **Package.json Scripts:**

```json
{
  "scripts": {
    "test:bdd": "cucumber-js",
    "test:bdd:smoke": "cucumber-js --tags '@smoke'",
    "test:bdd:regression": "cucumber-js --tags '@regression'",
    "test:bdd:member": "cucumber-js --tags '@member'",
    "test:bdd:claims": "cucumber-js --tags '@claims'",
    "test:bdd:api": "cucumber-js --tags '@api'",
    "test:bdd:parallel": "cucumber-js --parallel 4",
    "test:bdd:headed": "HEADLESS=false cucumber-js",
    "test:bdd:qa": "TEST_ENV=qa cucumber-js",
    "test:bdd:uat": "TEST_ENV=uat cucumber-js",
    "report:cucumber": "cucumber-html-reporter -i test-results/cucumber-report.json -o test-results/cucumber-report.html"
  }
}
```

### **Command Examples:**

```bash
# Run all BDD tests
npm run test:bdd

# Run smoke tests only
npm run test:bdd:smoke

# Run member-related tests
npm run test:bdd:member

# Run tests in headed mode
npm run test:bdd:headed

# Run tests against UAT environment
npm run test:bdd:uat

# Run specific feature
npx cucumber-js tests/features/member-authentication.feature

# Run with specific tags
npx cucumber-js --tags '@smoke and @member'

# Run with parallel execution
npm run test:bdd:parallel
```

## 🔍 8. Debugging and Troubleshooting

### **Debug Configuration:** `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug BDD Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/cucumber-js",
      "args": [
        "--require-module", "ts-node/register",
        "--require", "src/fixtures/step-definitions/**/*.ts",
        "tests/features/**/*.feature"
      ],
      "env": {
        "NODE_ENV": "test",
        "TEST_ENV": "qa",
        "HEADLESS": "false"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### **Logging Configuration:**

Add to step definitions for debugging:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';

Given('I am on the login page', async function() {
  console.log(`[DEBUG] Navigating to login page: ${process.env.BASE_URL}/login`);
  await this.loginPage.goto();
  console.log(`[DEBUG] Current URL: ${this.page.url()}`);
});
```

## 📋 9. Quick Setup Checklist

### **Initial Setup Steps:**

1. **Copy Environment File:**
   ```bash
   cp .env.example .env
   ```

2. **Update Credentials in `.env`:**
   - Set `BASE_URL`, `API_BASE_URL`, `SOAP_BASE_URL`
   - Add user credentials for all roles
   - Configure database connections
   - Set OAuth2 credentials

3. **Create Feature Files:**
   ```bash
   mkdir -p tests/features
   # Add your .feature files here
   ```

4. **Create Step Definitions:**
   ```bash
   mkdir -p src/fixtures/step-definitions
   # Add your step definition files here
   ```

5. **Install Dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

6. **Run Tests:**
   ```bash
   npm run test:bdd:smoke
   ```

This configuration guide provides complete instructions for setting up and customizing every aspect of the BDD testing framework. All configurations are centralized and easily maintainable.