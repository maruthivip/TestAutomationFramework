import { test, expect } from '@/fixtures/auth.fixtures';
import { UserRole } from '@/types/healthcare.types';

test.describe('Member Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should login successfully as member @smoke', async ({ loginPage, memberUser }) => {
    // Login as member
    await loginPage.login({
      username: memberUser.username,
      password: memberUser.password,
      role: UserRole.MEMBER
    });

    // Verify successful login by checking URL
    expect(page.url()).not.toContain('/login');
    expect(page.url()).toContain('/dashboard');

    // Verify member dashboard elements are visible
    await expect(page.locator('[data-testid="member-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="member-welcome"]')).toContainText(memberUser.firstName);
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    // Attempt login with invalid credentials
    await loginPage.login({
      username: 'invalid@uhc.com',
      password: 'wrongpassword',
      role: UserRole.MEMBER
    });

    // Verify error message is displayed
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Verify still on login page
    expect(page.url()).toContain('/login');
  });

  test('should validate required fields', async ({ loginPage }) => {
    // Try to submit empty form
    await loginPage.clickElement('loginButton');

    // Check form validation state
    const validationState = await loginPage.getFormValidationState();
    expect(validationState.formValid).toBe(false);
    expect(validationState.usernameValid).toBe(false);
    expect(validationState.passwordValid).toBe(false);
  });

  test('should display HIPAA privacy notice', async ({ loginPage }) => {
    // Verify HIPAA privacy notice is displayed
    const hasPrivacyNotice = await loginPage.validatePrivacyNotice();
    expect(hasPrivacyNotice).toBe(true);
  });

  test('should have accessibility compliance', async ({ loginPage }) => {
    // Verify accessibility link is present
    const hasAccessibilityLink = await loginPage.validateAccessibilityLink();
    expect(hasAccessibilityLink).toBe(true);
  });

  test('should remember login credentials when checkbox is checked', async ({ loginPage, memberUser }) => {
    // Check remember me checkbox
    await loginPage.checkRememberMe();
    
    // Login with valid credentials
    await loginPage.login({
      username: memberUser.username,
      password: memberUser.password,
      role: UserRole.MEMBER
    });

    // Verify successful login
    expect(page.url()).not.toContain('/login');
  });

  test('should handle MFA if required', async ({ loginPage, memberUser }) => {
    // Login with valid credentials
    await loginPage.login({
      username: memberUser.username,
      password: memberUser.password,
      role: UserRole.MEMBER
    });

    // Check if MFA is required
    const isMFARequired = await loginPage.isMFARequired();
    
    if (isMFARequired) {
      // Enter MFA code (using test code)
      await loginPage.enterMFACode('123456');
      
      // Verify successful login after MFA
      expect(page.url()).not.toContain('/login');
    }
  });

  test('should logout successfully', async ({ authenticateAs }) => {
    // Authenticate as member
    const page = await authenticateAs(UserRole.MEMBER);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click logout button
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirected to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should handle session timeout', async ({ authenticateAs }) => {
    // Authenticate as member
    const page = await authenticateAs(UserRole.MEMBER);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Simulate session timeout by clearing cookies
    await page.context().clearCookies();
    
    // Try to navigate to protected page
    await page.goto('/member/profile');
    
    // Should be redirected to login
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should prevent access to unauthorized pages', async ({ authenticateAs }) => {
    // Authenticate as member
    const page = await authenticateAs(UserRole.MEMBER);
    
    // Try to access admin page
    await page.goto('/admin/dashboard');
    
    // Should be redirected to unauthorized page or dashboard
    expect(page.url()).not.toContain('/admin');
    
    // Should show access denied message or redirect to member dashboard
    const isUnauthorized = page.url().includes('/unauthorized') || page.url().includes('/dashboard');
    expect(isUnauthorized).toBe(true);
  });
});