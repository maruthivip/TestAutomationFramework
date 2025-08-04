# BDD Testing Guide - Given-When-Then Format

This guide explains how to write and structure Behavior-Driven Development (BDD) tests using the Given-When-Then format in our Playwright Healthcare Framework.

## 🎯 BDD Overview

Behavior-Driven Development (BDD) is a software development approach that encourages collaboration between developers, QA, and business stakeholders. It uses natural language constructs to describe software behavior.

### The Given-When-Then Structure

- **Given** - Sets up the initial context/preconditions
- **When** - Describes the action/event that triggers the behavior
- **Then** - Specifies the expected outcome/result

## 📝 BDD Test Structure

### Basic Template

```typescript
test('Scenario: [Descriptive scenario name]', async ({ fixtures }) => {
  // Given [initial context]
  // Setup preconditions, authenticate users, prepare data
  
  // When [action occurs]
  // Perform the main action being tested
  
  // Then [expected outcome]
  // Verify the results and assertions
});
```

## 🏥 Healthcare-Specific BDD Examples

### 1. Member Authentication

```typescript
test('Scenario: Successful member login with valid credentials', async ({ loginPage, memberUser }) => {
  // Given I am on the login page
  await loginPage.goto();
  await expect(loginPage.page.locator('[data-testid="login-form"]')).toBeVisible();

  // When I enter valid member credentials
  await loginPage.fillElement('usernameInput', memberUser.username);
  await loginPage.fillElement('passwordInput', memberUser.password);
  await loginPage.selectRole(UserRole.MEMBER);

  // And I click the login button
  await loginPage.clickElement('loginButton');

  // Then I should be redirected to the member dashboard
  await loginPage.page.waitForURL(url => !url.includes('/login'));
  expect(loginPage.page.url()).toContain('/dashboard');

  // And I should see my member welcome message
  await expect(loginPage.page.locator('[data-testid="member-welcome"]')).toContainText(memberUser.firstName);
});
```

### 2. Claims Processing

```typescript
test('Scenario: Member submits a new medical claim successfully', async ({ authenticateAs }) => {
  // Given I am logged in as a member
  const memberPage = await authenticateAs(UserRole.MEMBER);
  
  // And I have valid insurance coverage
  const mockingUtils = createNetworkMockingUtils(memberPage);
  await mockingUtils.mockEligibilityAPI('MBR123456789', true);
  
  // When I navigate to the claims submission page
  await memberPage.goto('/claims/submit');
  await expect(memberPage.locator('[data-testid="claims-form"]')).toBeVisible();

  // And I fill in the claim details
  const claimData = HealthcareDataGenerator.generateClaim('MBR123456789', 'PRV123456');
  await memberPage.fill('[data-testid="provider-id"]', claimData.providerId);
  await memberPage.fill('[data-testid="service-date"]', claimData.serviceDate.toISOString().split('T')[0]);

  // And I submit the claim
  await mockingUtils.mockClaimsAPI(claimData.claimId, 'approved');
  await memberPage.click('[data-testid="submit-claim-button"]');

  // Then I should see a success confirmation
  await expect(memberPage.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(memberPage.locator('[data-testid="success-message"]')).toContainText('Claim submitted successfully');

  // And I should receive a claim confirmation number
  const confirmationNumber = await memberPage.locator('[data-testid="confirmation-number"]').textContent();
  expect(confirmationNumber).toMatch(/CLM\d{8}/);
});
```

### 3. Eligibility Verification

```typescript
test('Scenario: Provider verifies patient eligibility for covered services', async ({ authenticateAs }) => {
  // Given I am logged in as a healthcare provider
  const providerPage = await authenticateAs(UserRole.HEALTHCARE_PROVIDER);
  
  // And I have a patient who needs service verification
  const mockingUtils = createNetworkMockingUtils(providerPage);
  const memberId = 'MBR123456789';
  const providerId = 'PRV123456';
  
  // When I navigate to the eligibility verification page
  await providerPage.goto('/provider/eligibility/verify');
  await expect(providerPage.locator('[data-testid="eligibility-form"]')).toBeVisible();

  // And I enter the patient's member ID
  await providerPage.fill('[data-testid="member-id-input"]', memberId);
  
  // And I submit the eligibility verification request
  await mockingUtils.mockEligibilityAPI(memberId, true);
  await providerPage.click('[data-testid="verify-eligibility-button"]');

  // Then I should see the eligibility confirmation
  await expect(providerPage.locator('[data-testid="eligibility-status"]')).toContainText('Eligible');
  
  // And I should see the patient's benefit details
  await expect(providerPage.locator('[data-testid="deductible-remaining"]')).toBeVisible();
  await expect(providerPage.locator('[data-testid="copay-amount"]')).toBeVisible();
});
```

## 🔧 BDD Best Practices

### 1. Use Natural Language

Write scenarios in plain English that business stakeholders can understand:

```typescript
// ✅ Good - Natural language
test('Scenario: Member receives email notification when claim is approved', async () => {
  // Given I am a member with a pending claim
  // When the claims processor approves my claim
  // Then I should receive an email notification
});

// ❌ Avoid - Technical jargon
test('Scenario: POST /api/claims/{id}/approve returns 200 with notification trigger', async () => {
  // Too technical for business stakeholders
});
```

### 2. Focus on Business Value

Describe what the user wants to achieve, not how the system works:

```typescript
// ✅ Good - Business focused
test('Scenario: Member can view their remaining deductible amount', async () => {
  // Given I am logged in as a member
  // When I view my benefits summary
  // Then I should see how much of my deductible I have remaining
});

// ❌ Avoid - Implementation focused
test('Scenario: Database query returns correct deductible calculation', async () => {
  // Too focused on implementation details
});
```

### 3. One Scenario, One Behavior

Each scenario should test one specific behavior:

```typescript
// ✅ Good - Single behavior
test('Scenario: Member login with valid credentials succeeds', async () => {
  // Test only the successful login flow
});

test('Scenario: Member login with invalid credentials fails', async () => {
  // Test only the failed login flow
});

// ❌ Avoid - Multiple behaviors
test('Scenario: Member login handles both valid and invalid credentials', async () => {
  // Testing multiple behaviors in one scenario
});
```

### 4. Use Data-Driven Testing

Use realistic healthcare data:

```typescript
test('Scenario: Provider submits claim for different procedure types', async ({ authenticateAs }) => {
  // Given I am logged in as a provider
  const providerPage = await authenticateAs(UserRole.HEALTHCARE_PROVIDER);
  
  // Test data for different procedures
  const procedures = [
    { code: '99213', description: 'Office Visit', expectedCopay: 25.00 },
    { code: '99214', description: 'Extended Office Visit', expectedCopay: 50.00 },
    { code: '90471', description: 'Immunization', expectedCopay: 0.00 }
  ];

  for (const procedure of procedures) {
    // When I submit a claim for [procedure type]
    await providerPage.fill('[data-testid="procedure-code"]', procedure.code);
    await providerPage.click('[data-testid="submit-claim"]');

    // Then the claim should be processed with correct copay
    await expect(providerPage.locator('[data-testid="copay-amount"]')).toContainText(procedure.expectedCopay.toString());
  }
});
```

## 📊 BDD Test Organization

### File Structure

```
tests/bdd/
├── member-authentication.spec.ts     # Member login/logout scenarios
├── claims-processing.spec.ts          # Claims submission and processing
├── eligibility-verification.spec.ts  # Eligibility and benefits checking
├── payment-processing.spec.ts         # Payment and billing scenarios
├── provider-workflows.spec.ts         # Provider-specific workflows
├── api-integration.spec.ts           # API testing scenarios
└── compliance-security.spec.ts       # HIPAA and security scenarios
```

### Scenario Naming Convention

Use descriptive scenario names that explain the business value:

```typescript
// ✅ Good scenario names
test('Scenario: Member can view claim status after submission')
test('Scenario: Provider receives real-time eligibility verification')
test('Scenario: Claims processor can approve claims within SLA timeframe')
test('Scenario: System prevents access to PHI for unauthorized users')

// ❌ Avoid generic names
test('Scenario: Test login functionality')
test('Scenario: API returns data')
test('Scenario: Form validation works')
```

## 🏷️ Tags and Categories

Use tags to categorize and filter tests:

```typescript
test('Scenario: Member login with valid credentials @smoke @authentication', async () => {
  // Critical functionality - run in smoke tests
});

test('Scenario: Bulk claims processing performance @performance @regression', async () => {
  // Performance test - run in regression suite
});

test('Scenario: HIPAA audit log generation @security @compliance', async () => {
  // Security test - run in compliance suite
});
```

## 🔍 Debugging BDD Tests

### Add Descriptive Assertions

```typescript
// ✅ Good - Descriptive assertions
await expect(memberPage.locator('[data-testid="claim-status"]'))
  .toContainText('Approved', { timeout: 10000 });

// Add context to failures
await expect(memberPage.locator('[data-testid="error-message"]'))
  .not.toBeVisible('No error message should be displayed for valid claim submission');
```

### Use Step-by-Step Logging

```typescript
test('Scenario: Complex claims workflow', async ({ authenticateAs }) => {
  console.log('Step 1: Authenticating as claims processor');
  const processorPage = await authenticateAs(UserRole.CLAIMS_PROCESSOR);
  
  console.log('Step 2: Navigating to claims queue');
  await processorPage.goto('/claims/queue');
  
  console.log('Step 3: Selecting pending claim');
  await processorPage.click('[data-testid="pending-claim-123"]');
  
  console.log('Step 4: Reviewing claim details');
  await expect(processorPage.locator('[data-testid="claim-details"]')).toBeVisible();
});
```

## 📈 Reporting and Documentation

### Generate Living Documentation

BDD tests serve as living documentation. Use tools like Allure to generate reports that show:

- Feature coverage
- Scenario execution results
- Business requirements traceability
- Test execution trends

### Example Allure Annotations

```typescript
import { allure } from 'allure-playwright';

test('Scenario: Member enrollment process', async ({ authenticateAs }) => {
  await allure.feature('Member Management');
  await allure.story('Member Enrollment');
  await allure.severity('critical');
  
  await allure.step('Given I am a new member', async () => {
    // Setup new member data
  });
  
  await allure.step('When I complete the enrollment form', async () => {
    // Fill enrollment form
  });
  
  await allure.step('Then I should receive confirmation', async () => {
    // Verify enrollment confirmation
  });
});
```

## 🎯 Healthcare-Specific Considerations

### HIPAA Compliance Testing

```typescript
test('Scenario: PHI data is masked in audit logs @hipaa @security', async ({ authenticateAs }) => {
  // Given I am accessing patient information
  const csPage = await authenticateAs(UserRole.CUSTOMER_SERVICE);
  
  // When I view a member's profile
  await csPage.goto('/member/profile/MBR123456789');
  
  // Then sensitive data should be masked in logs
  const auditLogs = await csPage.evaluate(() => console.log.toString());
  expect(auditLogs).not.toContain('123-45-6789'); // SSN should be masked
  expect(auditLogs).not.toContain('1980-05-15'); // DOB should be masked
});
```

### Multi-Role Workflow Testing

```typescript
test('Scenario: End-to-end claim processing workflow @e2e @workflow', async ({ authenticateAs }) => {
  // Given a member submits a claim
  const memberPage = await authenticateAs(UserRole.MEMBER);
  const claimId = await submitClaim(memberPage);
  
  // When a claims processor reviews the claim
  const processorPage = await authenticateAs(UserRole.CLAIMS_PROCESSOR);
  await reviewAndApproveClaim(processorPage, claimId);
  
  // And the finance team processes payment
  const financePage = await authenticateAs(UserRole.FINANCE_TEAM);
  await processPayment(financePage, claimId);
  
  // Then the member should see the updated claim status
  await memberPage.reload();
  await expect(memberPage.locator(`[data-testid="claim-${claimId}-status"]`)).toContainText('Paid');
});
```

This BDD approach ensures our tests are readable, maintainable, and provide clear documentation of the healthcare system's expected behavior from a business perspective.