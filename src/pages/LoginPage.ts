import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { UserRole, LoginCredentials } from '@/types/healthcare.types';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/login');
    
    this.elements = {
      usernameInput: {
        selector: '[data-testid="username-input"]',
        description: 'Username input field'
      },
      passwordInput: {
        selector: '[data-testid="password-input"]',
        description: 'Password input field'
      },
      roleSelector: {
        selector: '[data-testid="role-selector"]',
        description: 'User role dropdown'
      },
      loginButton: {
        selector: '[data-testid="login-button"]',
        description: 'Login submit button'
      },
      forgotPasswordLink: {
        selector: '[data-testid="forgot-password-link"]',
        description: 'Forgot password link'
      },
      errorMessage: {
        selector: '[data-testid="error-message"]',
        description: 'Login error message'
      },
      loadingSpinner: {
        selector: '[data-testid="loading-spinner"]',
        description: 'Loading spinner during authentication'
      },
      rememberMeCheckbox: {
        selector: '[data-testid="remember-me-checkbox"]',
        description: 'Remember me checkbox'
      },
      ssoButton: {
        selector: '[data-testid="sso-login-button"]',
        description: 'Single Sign-On login button'
      },
      mfaCodeInput: {
        selector: '[data-testid="mfa-code-input"]',
        description: 'Multi-factor authentication code input'
      },
      mfaSubmitButton: {
        selector: '[data-testid="mfa-submit-button"]',
        description: 'MFA code submit button'
      },
      loginForm: {
        selector: '[data-testid="login-form"]',
        description: 'Main login form container'
      },
      logo: {
        selector: '[data-testid="project-logo"]',
        description: 'Project logo'
      },
      privacyNotice: {
        selector: '[data-testid="privacy-notice"]',
        description: 'HIPAA privacy notice'
      },
      accessibilityLink: {
        selector: '[data-testid="accessibility-link"]',
        description: 'Accessibility statement link'
      }
    };
  }

  /**
   * Check if login page is loaded
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement('loginForm');
      await this.waitForElement('usernameInput');
      await this.waitForElement('passwordInput');
      await this.waitForElement('loginButton');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<void> {
    await this.fillElement('usernameInput', credentials.username);
    await this.fillElement('passwordInput', credentials.password);
    
    if (credentials.role) {
      await this.selectRole(credentials.role);
    }
    
    await this.clickElement('loginButton');
    await this.waitForLoginCompletion();
  }

  /**
   * Login as specific user role
   */
  async loginAsRole(role: UserRole, username?: string, password?: string): Promise<void> {
    const credentials = this.getCredentialsForRole(role, username, password);
    await this.login(credentials);
  }

  /**
   * Login as member
   */
  async loginAsMember(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.MEMBER, username, password);
  }

  /**
   * Login as employee
   */
  async loginAsEmployee(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.EMPLOYEE, username, password);
  }

  /**
   * Login as administrator
   */
  async loginAsAdmin(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.ADMINISTRATOR, username, password);
  }

  /**
   * Login as broker
   */
  async loginAsBroker(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.BROKER, username, password);
  }

  /**
   * Login as claims processor
   */
  async loginAsClaimsProcessor(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.CLAIMS_PROCESSOR, username, password);
  }

  /**
   * Login as customer service
   */
  async loginAsCustomerService(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.CUSTOMER_SERVICE, username, password);
  }

  /**
   * Login as healthcare provider
   */
  async loginAsProvider(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.HEALTHCARE_PROVIDER, username, password);
  }

  /**
   * Login as finance team member
   */
  async loginAsFinance(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.FINANCE_TEAM, username, password);
  }

  /**
   * Login as compliance officer
   */
  async loginAsCompliance(username?: string, password?: string): Promise<void> {
    await this.loginAsRole(UserRole.COMPLIANCE_OFFICER, username, password);
  }

  /**
   * Select user role from dropdown
   */
  async selectRole(role: UserRole): Promise<void> {
    await this.selectOption('roleSelector', role);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement('forgotPasswordLink');
  }

  /**
   * Check remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    await this.checkElement('rememberMeCheckbox');
  }

  /**
   * Login with SSO
   */
  async loginWithSSO(): Promise<void> {
    await this.clickElement('ssoButton');
    await this.waitForNavigation();
  }

  /**
   * Enter MFA code
   */
  async enterMFACode(code: string): Promise<void> {
    await this.fillElement('mfaCodeInput', code);
    await this.clickElement('mfaSubmitButton');
    await this.waitForLoginCompletion();
  }

  /**
   * Get login error message
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isElementVisible('errorMessage')) {
      return await this.getElementText('errorMessage');
    }
    return '';
  }

  /**
   * Check if login failed
   */
  async hasLoginError(): Promise<boolean> {
    return await this.isElementVisible('errorMessage');
  }

  /**
   * Wait for login completion
   */
  async waitForLoginCompletion(): Promise<void> {
    // Wait for loading spinner to appear and disappear
    try {
      await this.waitForElement('loadingSpinner');
      await this.waitForElementHidden('loadingSpinner');
    } catch {
      // Loading spinner might not appear for fast logins
    }
    
    // Wait for navigation away from login page
    await this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
  }

  /**
   * Check if MFA is required
   */
  async isMFARequired(): Promise<boolean> {
    try {
      await this.waitForElement('mfaCodeInput');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get credentials for specific role
   */
  private getCredentialsForRole(role: UserRole, username?: string, password?: string): LoginCredentials {
    const defaultCredentials = {
      [UserRole.MEMBER]: {
        username: process.env.MEMBER_USERNAME || 'test.member@example.com',
        password: process.env.MEMBER_PASSWORD || 'TestPassword123!'
      },
      [UserRole.EMPLOYEE]: {
        username: process.env.EMPLOYEE_USERNAME || 'test.employee@example.com',
        password: process.env.EMPLOYEE_PASSWORD || 'TestPassword123!'
      },
      [UserRole.ADMINISTRATOR]: {
        username: process.env.ADMIN_USERNAME || 'test.admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'TestPassword123!'
      },
      [UserRole.BROKER]: {
        username: process.env.BROKER_USERNAME || 'test.broker@example.com',
        password: process.env.BROKER_PASSWORD || 'TestPassword123!'
      },
      [UserRole.CLAIMS_PROCESSOR]: {
        username: process.env.CLAIMS_PROCESSOR_USERNAME || 'test.claims@example.com',
        password: process.env.CLAIMS_PROCESSOR_PASSWORD || 'TestPassword123!'
      },
      [UserRole.CUSTOMER_SERVICE]: {
        username: process.env.CUSTOMER_SERVICE_USERNAME || 'test.cs@example.com',
        password: process.env.CUSTOMER_SERVICE_PASSWORD || 'TestPassword123!'
      },
      [UserRole.HEALTHCARE_PROVIDER]: {
        username: process.env.PROVIDER_USERNAME || 'test.provider@example.com',
        password: process.env.PROVIDER_PASSWORD || 'TestPassword123!'
      },
      [UserRole.FINANCE_TEAM]: {
        username: process.env.FINANCE_USERNAME || 'test.finance@example.com',
        password: process.env.FINANCE_PASSWORD || 'TestPassword123!'
      },
      [UserRole.COMPLIANCE_OFFICER]: {
        username: process.env.COMPLIANCE_USERNAME || 'test.compliance@example.com',
        password: process.env.COMPLIANCE_PASSWORD || 'TestPassword123!'
      }
    };

    const defaultCreds = defaultCredentials[role];
    
    return {
      username: username || defaultCreds.username,
      password: password || defaultCreds.password,
      role: role
    };
  }

  /**
   * Validate HIPAA privacy notice is displayed
   */
  async validatePrivacyNotice(): Promise<boolean> {
    return await this.isElementVisible('privacyNotice');
  }

  /**
   * Validate accessibility compliance
   */
  async validateAccessibilityLink(): Promise<boolean> {
    return await this.isElementVisible('accessibilityLink');
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.clearElement('usernameInput');
    await this.clearElement('passwordInput');
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled('loginButton');
  }

  /**
   * Get current form validation state
   */
  async getFormValidationState(): Promise<{
    usernameValid: boolean;
    passwordValid: boolean;
    formValid: boolean;
  }> {
    const usernameValid = (await this.getElementAttribute('usernameInput', 'aria-invalid')) !== 'true';
    const passwordValid = (await this.getElementAttribute('passwordInput', 'aria-invalid')) !== 'true';
    const formValid = await this.isLoginButtonEnabled();

    return {
      usernameValid,
      passwordValid,
      formValid
    };
  }
}