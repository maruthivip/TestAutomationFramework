import { Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '@/pages/LoginPage';
import { UserRole, User } from '@/types/healthcare.types';
import { AuthHelper } from '@/fixtures/auth.fixtures';
import { createNetworkMockingUtils } from '@/utils/NetworkMockingUtils';
import { HealthcareDataGenerator } from '@/utils/HealthcareDataGenerator';

// Base World class for BDD scenarios
export class HealthcareWorld {
  public page!: Page;
  public context!: BrowserContext;
  public loginPage!: LoginPage;
  public currentUser!: User;
  public currentPage!: Page;
  public claimData: any;
  public patientData: any;
  public memberData: any;
  public providerData: any;
  public apiCredentials: any;
  public apiResponse: any;
  public soapResponse: any;
  public accessToken: string = '';
  public confirmationNumber: string | null = null;
  public mockingUtils: any;

  constructor() {
    // Initialize world
  }

  async authenticateAs(role: UserRole): Promise<Page> {
    // Get user credentials for the specified role
    this.currentUser = AuthHelper.getUserForRole(role);
    
    // Navigate to login page
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
    
    // Perform authentication
    await this.loginPage.fillElement('usernameInput', this.currentUser.username);
    await this.loginPage.fillElement('passwordInput', this.currentUser.password);
    await this.loginPage.selectRole(role);
    await this.loginPage.clickElement('loginButton');
    
    // Wait for successful authentication
    await this.page.waitForURL((url: string) => !url.includes('/login'));
    
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
    if (!role) {
      throw new Error(`Unknown user type: ${userType}`);
    }
    return AuthHelper.getCredentialsForRole(role);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  async setupNetworkMocking() {
    this.mockingUtils = createNetworkMockingUtils(this.page);
  }

  generateTestData(dataType: string, ...args: any[]) {
    switch (dataType) {
      case 'claim':
        return HealthcareDataGenerator.generateClaim(args[0], args[1]);
      case 'member':
        return {
          memberId: HealthcareDataGenerator.generateMemberId(),
          firstName: 'Test',
          lastName: 'Member',
          dateOfBirth: new Date('1990-01-01'),
          coverageStatus: 'active'
        };
      case 'provider':
        return {
          providerId: HealthcareDataGenerator.generateProviderId(),
          name: 'Test Provider',
          npi: HealthcareDataGenerator.generateNPI(),
          specialty: 'General Practice'
        };
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }
}