import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import csvParser from 'csv-parser';
import { 
  TestData, 
  User, 
  InsurancePlan, 
  Provider, 
  Claim, 
  Payment,
  UserRole,
  PlanType,
  ClaimStatus,
  PaymentMethod,
  PaymentStatus
} from '@/types/healthcare.types';

export interface DataSource {
  type: 'json' | 'yaml' | 'csv' | 'database';
  path?: string;
  connection?: any;
}

export class TestDataManager {
  private static instance: TestDataManager;
  private testData: TestData;
  private dataPath: string;

  private constructor() {
    this.dataPath = path.join(__dirname, '../../test-data');
    this.testData = {
      users: [],
      plans: [],
      providers: [],
      claims: [],
      payments: []
    };
    this.ensureDataDirectory();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  /**
   * Load test data from various sources
   */
  async loadTestData(sources?: DataSource[]): Promise<TestData> {
    const defaultSources: DataSource[] = [
      { type: 'json', path: 'users.json' },
      { type: 'json', path: 'plans.json' },
      { type: 'json', path: 'providers.json' },
      { type: 'json', path: 'claims.json' },
      { type: 'json', path: 'payments.json' }
    ];

    const dataSources = sources || defaultSources;

    for (const source of dataSources) {
      try {
        await this.loadFromSource(source);
      } catch (error) {
        console.warn(`[TestData] Failed to load from ${source.path}:`, error);
        // Continue loading other sources
      }
    }

    // Generate default data if no data was loaded
    if (this.isEmpty()) {
      await this.generateDefaultData();
    }

    return this.testData;
  }

  /**
   * Load data from a specific source
   */
  private async loadFromSource(source: DataSource): Promise<void> {
    if (!source.path) return;

    const filePath = path.join(this.dataPath, source.path);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`[TestData] File not found: ${filePath}`);
      return;
    }

    switch (source.type) {
      case 'json':
        await this.loadFromJson(filePath);
        break;
      case 'yaml':
        await this.loadFromYaml(filePath);
        break;
      case 'csv':
        await this.loadFromCsv(filePath);
        break;
      default:
        console.warn(`[TestData] Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Load data from JSON file
   */
  private async loadFromJson(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    this.mergeData(data);
  }

  /**
   * Load data from YAML file
   */
  private async loadFromYaml(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as any;
    this.mergeData(data);
  }

  /**
   * Load data from CSV file
   */
  private async loadFromCsv(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Determine data type based on filename
          const filename = path.basename(filePath, '.csv');
          this.processCsvData(filename, results);
          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Process CSV data based on type
   */
  private processCsvData(type: string, data: any[]): void {
    switch (type) {
      case 'users':
        this.testData.users = data.map(this.mapCsvToUser);
        break;
      case 'plans':
        this.testData.plans = data.map(this.mapCsvToPlan);
        break;
      case 'providers':
        this.testData.providers = data.map(this.mapCsvToProvider);
        break;
      case 'claims':
        this.testData.claims = data.map(this.mapCsvToClaim);
        break;
      case 'payments':
        this.testData.payments = data.map(this.mapCsvToPayment);
        break;
    }
  }

  /**
   * Map CSV row to User object
   */
  private mapCsvToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      role: row.role as UserRole,
      firstName: row.firstName,
      lastName: row.lastName,
      permissions: row.permissions ? row.permissions.split(',') : [],
      isActive: row.isActive === 'true'
    };
  }

  /**
   * Map CSV row to Plan object
   */
  private mapCsvToPlan(row: any): InsurancePlan {
    return {
      planId: row.planId,
      planName: row.planName,
      planType: row.planType as PlanType,
      effectiveDate: new Date(row.effectiveDate),
      expirationDate: new Date(row.expirationDate),
      isActive: row.isActive === 'true',
      // Add other required fields with defaults
      coverage: {
        medical: true,
        dental: false,
        vision: false,
        prescription: true,
        mentalHealth: true,
        preventiveCare: true
      },
      premiums: {
        individual: parseFloat(row.individualPremium) || 0,
        family: parseFloat(row.familyPremium) || 0,
        employeeContribution: parseFloat(row.employeeContribution) || 0,
        employerContribution: parseFloat(row.employerContribution) || 0
      },
      deductibles: {
        individual: parseFloat(row.individualDeductible) || 0,
        family: parseFloat(row.familyDeductible) || 0,
        inNetwork: parseFloat(row.inNetworkDeductible) || 0,
        outOfNetwork: parseFloat(row.outOfNetworkDeductible) || 0
      },
      copays: {
        primaryCare: parseFloat(row.primaryCareCopay) || 0,
        specialist: parseFloat(row.specialistCopay) || 0,
        urgentCare: parseFloat(row.urgentCareCopay) || 0,
        emergencyRoom: parseFloat(row.emergencyRoomCopay) || 0,
        prescription: {
          generic: parseFloat(row.genericCopay) || 0,
          brandName: parseFloat(row.brandNameCopay) || 0,
          specialty: parseFloat(row.specialtyCopay) || 0
        }
      },
      outOfPocketMax: parseFloat(row.outOfPocketMax) || 0,
      networkProviders: []
    };
  }

  /**
   * Map CSV row to Provider object
   */
  private mapCsvToProvider(row: any): Provider {
    return {
      providerId: row.providerId,
      npi: row.npi,
      name: row.name,
      specialty: row.specialty,
      phone: row.phone,
      isInNetwork: row.isInNetwork === 'true',
      acceptingNewPatients: row.acceptingNewPatients === 'true',
      address: {
        street1: row.street1,
        street2: row.street2,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        country: row.country || 'USA'
      }
    };
  }

  /**
   * Map CSV row to Claim object
   */
  private mapCsvToClaim(row: any): Claim {
    return {
      claimId: row.claimId,
      memberId: row.memberId,
      providerId: row.providerId,
      serviceDate: new Date(row.serviceDate),
      submissionDate: new Date(row.submissionDate),
      status: row.status as ClaimStatus,
      amount: {
        billed: parseFloat(row.billedAmount) || 0,
        allowed: parseFloat(row.allowedAmount) || 0,
        paid: parseFloat(row.paidAmount) || 0,
        memberResponsibility: parseFloat(row.memberResponsibility) || 0,
        deductible: parseFloat(row.deductible) || 0,
        copay: parseFloat(row.copay) || 0,
        coinsurance: parseFloat(row.coinsurance) || 0
      },
      diagnosis: [],
      procedures: []
    };
  }

  /**
   * Map CSV row to Payment object
   */
  private mapCsvToPayment(row: any): Payment {
    return {
      paymentId: row.paymentId,
      memberId: row.memberId,
      amount: parseFloat(row.amount) || 0,
      paymentMethod: row.paymentMethod as PaymentMethod,
      paymentDate: new Date(row.paymentDate),
      dueDate: new Date(row.dueDate),
      status: row.status as PaymentStatus,
      invoiceId: row.invoiceId,
      description: row.description
    };
  }

  /**
   * Merge data into existing test data
   */
  private mergeData(data: Partial<TestData>): void {
    if (data.users) this.testData.users = [...this.testData.users, ...data.users];
    if (data.plans) this.testData.plans = [...this.testData.plans, ...data.plans];
    if (data.providers) this.testData.providers = [...this.testData.providers, ...data.providers];
    if (data.claims) this.testData.claims = [...this.testData.claims, ...data.claims];
    if (data.payments) this.testData.payments = [...this.testData.payments, ...data.payments];
  }

  /**
   * Check if test data is empty
   */
  private isEmpty(): boolean {
    return this.testData.users.length === 0 &&
           this.testData.plans.length === 0 &&
           this.testData.providers.length === 0 &&
           this.testData.claims.length === 0 &&
           this.testData.payments.length === 0;
  }

  /**
   * Generate default test data
   */
  private async generateDefaultData(): Promise<void> {
    console.log('[TestData] Generating default test data');
    
    // Generate default data and save to files
    const defaultData = this.createDefaultTestData();
    
    await this.saveTestData('users.json', { users: defaultData.users });
    await this.saveTestData('plans.json', { plans: defaultData.plans });
    await this.saveTestData('providers.json', { providers: defaultData.providers });
    await this.saveTestData('claims.json', { claims: defaultData.claims });
    await this.saveTestData('payments.json', { payments: defaultData.payments });
    
    this.testData = defaultData;
  }

  /**
   * Create default test data
   */
  private createDefaultTestData(): TestData {
    return {
      users: this.generateDefaultUsers(),
      plans: this.generateDefaultPlans(),
      providers: this.generateDefaultProviders(),
      claims: this.generateDefaultClaims(),
      payments: this.generateDefaultPayments()
    };
  }

  /**
   * Generate default users
   */
  private generateDefaultUsers(): User[] {
    const roles = Object.values(UserRole);
    return roles.map((role, index) => ({
      id: `user_${index + 1}`,
      username: `test.${role}@uhc.com`,
      password: 'TestPassword123!',
      email: `test.${role}@uhc.com`,
      role: role,
      firstName: `Test${role.charAt(0).toUpperCase() + role.slice(1)}`,
      lastName: 'User',
      permissions: this.getDefaultPermissions(role),
      isActive: true
    }));
  }

  /**
   * Generate default plans
   */
  private generateDefaultPlans(): InsurancePlan[] {
    return [
      {
        planId: 'PLAN_001',
        planName: 'UHC Basic Plan',
        planType: PlanType.HMO,
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-12-31'),
        isActive: true,
        coverage: {
          medical: true,
          dental: false,
          vision: false,
          prescription: true,
          mentalHealth: true,
          preventiveCare: true
        },
        premiums: {
          individual: 250.00,
          family: 750.00,
          employeeContribution: 100.00,
          employerContribution: 150.00
        },
        deductibles: {
          individual: 1000.00,
          family: 2000.00,
          inNetwork: 1000.00,
          outOfNetwork: 2000.00
        },
        copays: {
          primaryCare: 25.00,
          specialist: 50.00,
          urgentCare: 75.00,
          emergencyRoom: 200.00,
          prescription: {
            generic: 10.00,
            brandName: 30.00,
            specialty: 100.00
          }
        },
        outOfPocketMax: 5000.00,
        networkProviders: []
      }
    ];
  }

  /**
   * Generate default providers
   */
  private generateDefaultProviders(): Provider[] {
    return [
      {
        providerId: 'PRV_001',
        npi: '1234567890',
        name: 'Dr. John Smith',
        specialty: 'Primary Care',
        phone: '555-0001',
        isInNetwork: true,
        acceptingNewPatients: true,
        address: {
          street1: '123 Medical Center Dr',
          city: 'Healthcare City',
          state: 'HC',
          zipCode: '12345',
          country: 'USA'
        }
      }
    ];
  }

  /**
   * Generate default claims
   */
  private generateDefaultClaims(): Claim[] {
    return [
      {
        claimId: 'CLM_001',
        memberId: 'MBR_001',
        providerId: 'PRV_001',
        serviceDate: new Date('2024-01-15'),
        submissionDate: new Date('2024-01-16'),
        status: ClaimStatus.APPROVED,
        amount: {
          billed: 150.00,
          allowed: 120.00,
          paid: 95.00,
          memberResponsibility: 25.00,
          deductible: 0.00,
          copay: 25.00,
          coinsurance: 0.00
        },
        diagnosis: [],
        procedures: []
      }
    ];
  }

  /**
   * Generate default payments
   */
  private generateDefaultPayments(): Payment[] {
    return [
      {
        paymentId: 'PAY_001',
        memberId: 'MBR_001',
        amount: 250.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-31'),
        status: PaymentStatus.COMPLETED,
        invoiceId: 'INV_001',
        description: 'Monthly Premium Payment'
      }
    ];
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: UserRole): string[] {
    const permissionMap: Record<UserRole, string[]> = {
      [UserRole.MEMBER]: ['view_plans', 'view_claims', 'make_payments'],
      [UserRole.EMPLOYEE]: ['view_members', 'process_claims', 'view_reports'],
      [UserRole.ADMINISTRATOR]: ['*'],
      [UserRole.BROKER]: ['view_plans', 'sell_plans', 'manage_clients'],
      [UserRole.CLAIMS_PROCESSOR]: ['process_claims', 'approve_claims', 'view_member_info'],
      [UserRole.CUSTOMER_SERVICE]: ['view_member_info', 'update_member_info', 'process_inquiries'],
      [UserRole.HEALTHCARE_PROVIDER]: ['verify_eligibility', 'submit_claims', 'view_authorizations'],
      [UserRole.FINANCE_TEAM]: ['view_payments', 'process_payments', 'view_financial_reports'],
      [UserRole.COMPLIANCE_OFFICER]: ['view_audit_logs', 'generate_compliance_reports', 'manage_policies']
    };

    return permissionMap[role] || [];
  }

  /**
   * Save test data to file
   */
  async saveTestData(filename: string, data: any): Promise<void> {
    const filePath = path.join(this.dataPath, filename);
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Get all test data
   */
  getTestData(): TestData {
    return this.testData;
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): User[] {
    return this.testData.users.filter(user => user.role === role);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    return this.testData.users.find(user => user.id === id);
  }

  /**
   * Get plan by ID
   */
  getPlanById(id: string): InsurancePlan | undefined {
    return this.testData.plans.find(plan => plan.planId === id);
  }

  /**
   * Get provider by ID
   */
  getProviderById(id: string): Provider | undefined {
    return this.testData.providers.find(provider => provider.providerId === id);
  }

  /**
   * Get claims by member ID
   */
  getClaimsByMemberId(memberId: string): Claim[] {
    return this.testData.claims.filter(claim => claim.memberId === memberId);
  }

  /**
   * Get payments by member ID
   */
  getPaymentsByMemberId(memberId: string): Payment[] {
    return this.testData.payments.filter(payment => payment.memberId === memberId);
  }

  /**
   * Add custom test data
   */
  addTestData(data: Partial<TestData>): void {
    this.mergeData(data);
  }

  /**
   * Clear all test data
   */
  clearTestData(): void {
    this.testData = {
      users: [],
      plans: [],
      providers: [],
      claims: [],
      payments: []
    };
  }

  /**
   * Reset to default data
   */
  async resetToDefaults(): Promise<void> {
    this.clearTestData();
    await this.generateDefaultData();
  }
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();