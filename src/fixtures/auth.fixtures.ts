import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '@/pages/LoginPage';
import { UserRole, User, LoginCredentials } from '@/types/healthcare.types';
import { getCurrentEnvironment } from '@/config/environments';

// Define fixture types
export interface AuthFixtures {
  loginPage: LoginPage;
  authenticatedPage: Page;
  memberUser: User;
  employeeUser: User;
  adminUser: User;
  brokerUser: User;
  claimsProcessorUser: User;
  customerServiceUser: User;
  providerUser: User;
  financeUser: User;
  complianceUser: User;
  authenticateAs: (role: UserRole, credentials?: LoginCredentials) => Promise<Page>;
  loginAs: (role: UserRole) => Promise<void>;
}

// Test data for different user roles
const testUsers: Record<UserRole, User> = {
  [UserRole.MEMBER]: {
    id: 'member_001',
    username: process.env.MEMBER_USERNAME || 'test.member@uhc.com',
    password: process.env.MEMBER_PASSWORD || 'TestPassword123!',
    email: 'test.member@uhc.com',
    role: UserRole.MEMBER,
    firstName: 'John',
    lastName: 'Member',
    permissions: ['view_plans', 'view_claims', 'make_payments'],
    isActive: true,
    profile: {
      memberId: 'MBR123456789',
      phone: '555-0101',
      address: {
        street1: '123 Member St',
        city: 'Healthcare City',
        state: 'HC',
        zipCode: '12345',
        country: 'USA'
      }
    }
  },
  [UserRole.EMPLOYEE]: {
    id: 'emp_001',
    username: process.env.EMPLOYEE_USERNAME || 'test.employee@uhc.com',
    password: process.env.EMPLOYEE_PASSWORD || 'TestPassword123!',
    email: 'test.employee@uhc.com',
    role: UserRole.EMPLOYEE,
    firstName: 'Jane',
    lastName: 'Employee',
    permissions: ['view_members', 'process_claims', 'view_reports'],
    isActive: true,
    profile: {
      employeeId: 'EMP123456',
      department: 'Claims Processing',
      title: 'Claims Specialist',
      phone: '555-0102'
    }
  },
  [UserRole.ADMINISTRATOR]: {
    id: 'admin_001',
    username: process.env.ADMIN_USERNAME || 'test.admin@uhc.com',
    password: process.env.ADMIN_PASSWORD || 'TestPassword123!',
    email: 'test.admin@uhc.com',
    role: UserRole.ADMINISTRATOR,
    firstName: 'Admin',
    lastName: 'User',
    permissions: ['*'], // All permissions
    isActive: true,
    profile: {
      employeeId: 'ADM123456',
      department: 'IT Administration',
      title: 'System Administrator',
      phone: '555-0103'
    }
  },
  [UserRole.BROKER]: {
    id: 'broker_001',
    username: process.env.BROKER_USERNAME || 'test.broker@uhc.com',
    password: process.env.BROKER_PASSWORD || 'TestPassword123!',
    email: 'test.broker@uhc.com',
    role: UserRole.BROKER,
    firstName: 'Bob',
    lastName: 'Broker',
    permissions: ['view_plans', 'sell_plans', 'manage_clients'],
    isActive: true,
    profile: {
      brokerId: 'BRK123456',
      department: 'Sales',
      title: 'Insurance Broker',
      phone: '555-0104'
    }
  },
  [UserRole.CLAIMS_PROCESSOR]: {
    id: 'claims_001',
    username: process.env.CLAIMS_PROCESSOR_USERNAME || 'test.claims@uhc.com',
    password: process.env.CLAIMS_PROCESSOR_PASSWORD || 'TestPassword123!',
    email: 'test.claims@uhc.com',
    role: UserRole.CLAIMS_PROCESSOR,
    firstName: 'Carol',
    lastName: 'Claims',
    permissions: ['process_claims', 'approve_claims', 'view_member_info'],
    isActive: true,
    profile: {
      employeeId: 'CLP123456',
      department: 'Claims Processing',
      title: 'Senior Claims Processor',
      phone: '555-0105'
    }
  },
  [UserRole.CUSTOMER_SERVICE]: {
    id: 'cs_001',
    username: process.env.CUSTOMER_SERVICE_USERNAME || 'test.cs@uhc.com',
    password: process.env.CUSTOMER_SERVICE_PASSWORD || 'TestPassword123!',
    email: 'test.cs@uhc.com',
    role: UserRole.CUSTOMER_SERVICE,
    firstName: 'David',
    lastName: 'Service',
    permissions: ['view_member_info', 'update_member_info', 'process_inquiries'],
    isActive: true,
    profile: {
      employeeId: 'CS123456',
      department: 'Customer Service',
      title: 'Customer Service Representative',
      phone: '555-0106'
    }
  },
  [UserRole.HEALTHCARE_PROVIDER]: {
    id: 'provider_001',
    username: process.env.PROVIDER_USERNAME || 'test.provider@uhc.com',
    password: process.env.PROVIDER_PASSWORD || 'TestPassword123!',
    email: 'test.provider@uhc.com',
    role: UserRole.HEALTHCARE_PROVIDER,
    firstName: 'Dr. Emily',
    lastName: 'Provider',
    permissions: ['verify_eligibility', 'submit_claims', 'view_authorizations'],
    isActive: true,
    profile: {
      providerId: 'PRV123456',
      department: 'Primary Care',
      title: 'Primary Care Physician',
      phone: '555-0107'
    }
  },
  [UserRole.FINANCE_TEAM]: {
    id: 'finance_001',
    username: process.env.FINANCE_USERNAME || 'test.finance@uhc.com',
    password: process.env.FINANCE_PASSWORD || 'TestPassword123!',
    email: 'test.finance@uhc.com',
    role: UserRole.FINANCE_TEAM,
    firstName: 'Frank',
    lastName: 'Finance',
    permissions: ['view_payments', 'process_payments', 'view_financial_reports'],
    isActive: true,
    profile: {
      employeeId: 'FIN123456',
      department: 'Finance',
      title: 'Financial Analyst',
      phone: '555-0108'
    }
  },
  [UserRole.COMPLIANCE_OFFICER]: {
    id: 'compliance_001',
    username: process.env.COMPLIANCE_USERNAME || 'test.compliance@uhc.com',
    password: process.env.COMPLIANCE_PASSWORD || 'TestPassword123!',
    email: 'test.compliance@uhc.com',
    role: UserRole.COMPLIANCE_OFFICER,
    firstName: 'Grace',
    lastName: 'Compliance',
    permissions: ['view_audit_logs', 'generate_compliance_reports', 'manage_policies'],
    isActive: true,
    profile: {
      employeeId: 'COM123456',
      department: 'Compliance',
      title: 'Compliance Officer',
      phone: '555-0109'
    }
  }
};

// Storage state files for authenticated sessions
const AUTH_STORAGE_DIR = 'auth-storage';
const getStorageStatePath = (role: UserRole): string => `${AUTH_STORAGE_DIR}/${role}-auth.json`;

// Extended test with authentication fixtures
export const test = base.extend<AuthFixtures>({
  // Login page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Authenticated page fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // User fixtures for each role
  memberUser: async ({}, use) => {
    await use(testUsers[UserRole.MEMBER]);
  },

  employeeUser: async ({}, use) => {
    await use(testUsers[UserRole.EMPLOYEE]);
  },

  adminUser: async ({}, use) => {
    await use(testUsers[UserRole.ADMINISTRATOR]);
  },

  brokerUser: async ({}, use) => {
    await use(testUsers[UserRole.BROKER]);
  },

  claimsProcessorUser: async ({}, use) => {
    await use(testUsers[UserRole.CLAIMS_PROCESSOR]);
  },

  customerServiceUser: async ({}, use) => {
    await use(testUsers[UserRole.CUSTOMER_SERVICE]);
  },

  providerUser: async ({}, use) => {
    await use(testUsers[UserRole.HEALTHCARE_PROVIDER]);
  },

  financeUser: async ({}, use) => {
    await use(testUsers[UserRole.FINANCE_TEAM]);
  },

  complianceUser: async ({}, use) => {
    await use(testUsers[UserRole.COMPLIANCE_OFFICER]);
  },

  // Authentication helper function
  authenticateAs: async ({ browser }, use) => {
    const authenticateAs = async (role: UserRole, credentials?: LoginCredentials): Promise<Page> => {
      const user = testUsers[role];
      const loginCredentials = credentials || {
        username: user.username,
        password: user.password,
        role: role
      };

      // Try to load existing authentication state
      const storageStatePath = getStorageStatePath(role);
      let context: BrowserContext;

      try {
        // Load existing authentication state if available
        context = await browser.newContext({ storageState: storageStatePath });
        const page = await context.newPage();
        
        // Verify authentication is still valid
        await page.goto('/dashboard');
        
        // If we can access dashboard without redirect to login, auth is valid
        if (!page.url().toString().includes('/login')) {
          console.log(`[Auth] Using cached authentication for ${role}`);
          return page;
        }
        
        // Authentication expired, close context and create new one
        await context.close();
        throw new Error('Authentication expired');
      } catch (error) {
        // Create new context and authenticate
        context = await browser.newContext();
        const page = await context.newPage();
        
        console.log(`[Auth] Authenticating as ${role}`);
        
        // Navigate to login page and authenticate
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(loginCredentials);
        
        // Wait for successful login (redirect to dashboard)
        await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
        
        // Save authentication state
        await context.storageState({ path: storageStatePath });
        console.log(`[Auth] Authentication state saved for ${role}`);
        
        return page;
      }
    };

    await use(authenticateAs);
  },

  // Simple login helper
  loginAs: async ({ page, loginPage }, use) => {
    const loginAs = async (role: UserRole): Promise<void> => {
      const user = testUsers[role];
      const credentials: LoginCredentials = {
        username: user.username,
        password: user.password,
        role: role
      };

      await loginPage.goto();
      await loginPage.login(credentials);
      
      // Wait for successful login
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
      console.log(`[Auth] Successfully logged in as ${role}`);
    };

    await use(loginAs);
  }
});

// Export expect from Playwright
export { expect } from '@playwright/test';

// Helper functions for authentication in tests
export class AuthHelper {
  /**
   * Get user data for a specific role
   */
  static getUserForRole(role: UserRole): User {
    return testUsers[role];
  }

  /**
   * Get credentials for a specific role
   */
  static getCredentialsForRole(role: UserRole): LoginCredentials {
    const user = testUsers[role];
    return {
      username: user.username,
      password: user.password,
      role: role
    };
  }

  /**
   * Validate user has required permissions
   */
  static hasPermission(user: User, permission: string): boolean {
    if (user.permissions.includes('*')) {
      return true; // Admin has all permissions
    }
    return user.permissions.includes(permission);
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Get roles with specific permission
   */
  static getRolesWithPermission(permission: string): UserRole[] {
    return Object.values(UserRole).filter(role => {
      const user = testUsers[role];
      return this.hasPermission(user, permission);
    });
  }

  /**
   * Create custom user for testing
   */
  static createCustomUser(overrides: Partial<User>): User {
    const baseUser = testUsers[UserRole.MEMBER];
    return {
      ...baseUser,
      ...overrides,
      id: overrides.id || `custom_${Date.now()}`,
    };
  }

  /**
   * Validate authentication state
   */
  static async validateAuthState(page: Page, expectedRole: UserRole): Promise<boolean> {
    try {
      // Check if user is on a protected page (not login)
      if (page.url().toString().includes('/login')) {
        return false;
      }

      // Additional validation can be added here
      // For example, checking user profile information
      return true;
    } catch (error) {
      console.error('[Auth Validation] Error:', error);
      return false;
    }
  }

  /**
   * Clear all authentication states
   */
  static async clearAllAuthStates(): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    try {
      if (fs.existsSync(AUTH_STORAGE_DIR)) {
        const files = fs.readdirSync(AUTH_STORAGE_DIR);
        for (const file of files) {
          if (file.endsWith('-auth.json')) {
            fs.unlinkSync(path.join(AUTH_STORAGE_DIR, file));
          }
        }
        console.log('[Auth] All authentication states cleared');
      }
    } catch (error) {
      console.error('[Auth] Error clearing authentication states:', error);
    }
  }
}