import { faker } from '@faker-js/faker';
import moment from 'moment';
import { 
  User, 
  UserRole, 
  InsurancePlan, 
  Provider, 
  Claim, 
  Payment,
  PlanType,
  ClaimStatus,
  PaymentMethod,
  PaymentStatus,
  Address
} from '@/types/healthcare.types';

declare module '@faker-js/faker';

export class HealthcareDataGenerator {
  /**
   * Generate random member ID
   */
  static generateMemberId(): string {
    return `MBR${faker.datatype.number({ min: 100000000, max: 999999999 })}`;
  }

  /**
   * Generate random provider ID
   */
  static generateProviderId(): string {
    return `PRV${faker.datatype.number({ min: 100000, max: 999999 })}`;
  }

  /**
   * Generate random claim ID
   */
  static generateClaimId(): string {
    return `CLM${faker.datatype.number({ min: 10000000, max: 99999999 })}`;
  }

  /**
   * Generate random payment ID
   */
  static generatePaymentId(): string {
    return `PAY${faker.datatype.number({ min: 10000000, max: 99999999 })}`;
  }

  /**
   * Generate random plan ID
   */
  static generatePlanId(): string {
    return `PLN${faker.datatype.number({ min: 1000, max: 9999 })}`;
  }

  /**
   * Generate random NPI (National Provider Identifier)
   */
  static generateNPI(): string {
    return faker.datatype.number({ min: 1000000000, max: 9999999999 }).toString();
  }

  /**
   * Generate random SSN (for testing purposes only)
   */
  static generateSSN(): string {
    const area = faker.datatype.number({ min: 100, max: 999 });
    const group = faker.datatype.number({ min: 10, max: 99 });
    const serial = faker.datatype.number({ min: 1000, max: 9999 });
    return `${area}-${group}-${serial}`;
  }

  /**
   * Generate random date of birth (adult)
   */
  static generateDateOfBirth(): Date {
    return faker.date.between('1940-01-01', '2005-12-31');
  }

  /**
   * Generate random service date (within last 2 years)
   */
  static generateServiceDate(): Date {
    return faker.date.between(
      moment().subtract(2, 'years').toDate(),
      new Date()
    );
  }

  /**
   * Generate random future date
   */
  static generateFutureDate(daysFromNow: number = 30): Date {
    return faker.date.between(
      new Date(),
      moment().add(daysFromNow, 'days').toDate()
    );
  }

  /**
   * Generate random address
   */
  static generateAddress(): Address {
    return {
      street1: faker.address.streetAddress(),
      street2: faker.datatype.boolean() ? faker.address.secondaryAddress() : undefined,
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zipCode: faker.address.zipCode(),
      country: 'USA'
    };
  }

  /**
   * Generate random phone number
   */
  static generatePhoneNumber(): string {
    return faker.phone.phoneNumber('###-###-####');
  }

  /**
   * Generate random email
   */
  static generateEmail(domain: string = 'uhc.com'): string {
    return `${faker.internet.userName()}@${domain}`;
  }

  /**
   * Generate random user
   */
  static generateUser(role: UserRole): User {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@uhc.com`;

    return {
      id: faker.datatype.uuid(),
      username: username,
      password: 'TestPassword123!',
      email: username,
      role: role,
      firstName: firstName,
      lastName: lastName,
      permissions: this.getPermissionsForRole(role),
      isActive: faker.datatype.boolean(0.9), // 90% chance of being active
      lastLogin: faker.date.recent(30),
      profile: {
        memberId: role === UserRole.MEMBER ? this.generateMemberId() : undefined,
        employeeId: role !== UserRole.MEMBER ? `EMP${faker.datatype.number({ min: 100000, max: 999999 })}` : undefined,
        providerId: role === UserRole.HEALTHCARE_PROVIDER ? this.generateProviderId() : undefined,
        brokerId: role === UserRole.BROKER ? `BRK${faker.datatype.number({ min: 100000, max: 999999 })}` : undefined,
        department: this.getDepartmentForRole(role),
        title: this.getTitleForRole(role),
        phone: this.generatePhoneNumber(),
        address: this.generateAddress()
      }
    };
  }

  /**
   * Generate random insurance plan
   */
  static generateInsurancePlan(): InsurancePlan {
    const planTypes = Object.values(PlanType);
    const planType = faker.random.arrayElement(planTypes);
    
    return {
      planId: this.generatePlanId(),
      planName: `${faker.company.companyName()} ${planType} Plan`,
      planType: planType,
      effectiveDate: faker.date.between('2024-01-01', '2024-12-31'),
      expirationDate: faker.date.between('2024-12-31', '2025-12-31'),
      isActive: faker.datatype.boolean(0.8),
      coverage: {
        medical: true,
        dental: faker.datatype.boolean(0.7),
        vision: faker.datatype.boolean(0.6),
        prescription: faker.datatype.boolean(0.9),
        mentalHealth: faker.datatype.boolean(0.8),
        preventiveCare: true
      },
      premiums: {
        individual: faker.datatype.number({ min: 200, max: 800 }),
        family: faker.datatype.number({ min: 600, max: 2000 }),
        employeeContribution: faker.datatype.number({ min: 50, max: 300 }),
        employerContribution: faker.datatype.number({ min: 150, max: 500 })
      },
      deductibles: {
        individual: faker.datatype.number({ min: 500, max: 5000 }),
        family: faker.datatype.number({ min: 1000, max: 10000 }),
        inNetwork: faker.datatype.number({ min: 500, max: 3000 }),
        outOfNetwork: faker.datatype.number({ min: 1000, max: 6000 })
      },
      copays: {
        primaryCare: faker.datatype.number({ min: 15, max: 50 }),
        specialist: faker.datatype.number({ min: 30, max: 100 }),
        urgentCare: faker.datatype.number({ min: 50, max: 150 }),
        emergencyRoom: faker.datatype.number({ min: 100, max: 500 }),
        prescription: {
          generic: faker.datatype.number({ min: 5, max: 20 }),
          brandName: faker.datatype.number({ min: 20, max: 60 }),
          specialty: faker.datatype.number({ min: 50, max: 200 })
        }
      },
      outOfPocketMax: faker.datatype.number({ min: 3000, max: 15000 }),
      networkProviders: []
    };
  }

  /**
   * Generate random provider
   */
  static generateProvider(): Provider {
    const specialties = [
      'Primary Care', 'Cardiology', 'Dermatology', 'Endocrinology',
      'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
      'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
    ];

    return {
      providerId: this.generateProviderId(),
      npi: this.generateNPI(),
      name: `Dr. ${faker.name.firstName()} ${faker.name.lastName()}`,
      specialty: faker.random.arrayElement(specialties),
      phone: this.generatePhoneNumber(),
      isInNetwork: faker.datatype.boolean(0.8),
      acceptingNewPatients: faker.datatype.boolean(0.7),
      address: this.generateAddress()
    };
  }

  /**
   * Generate random claim
   */
  static generateClaim(memberId?: string, providerId?: string): Claim {
    const claimStatuses = Object.values(ClaimStatus);
    const billedAmount = faker.datatype.number({ min: 50, max: 5000 });
    const allowedAmount = billedAmount * faker.datatype.float({ min: 0.7, max: 1.0 });
    const memberResponsibility = allowedAmount * faker.datatype.float({ min: 0.1, max: 0.3 });
    const paidAmount = allowedAmount - memberResponsibility;

    return {
      claimId: this.generateClaimId(),
      memberId: memberId || this.generateMemberId(),
      providerId: providerId || this.generateProviderId(),
      serviceDate: this.generateServiceDate(),
      submissionDate: faker.date.recent(30),
      status: faker.random.arrayElement(claimStatuses),
      amount: {
        billed: billedAmount,
        allowed: allowedAmount,
        paid: paidAmount,
        memberResponsibility: memberResponsibility,
        deductible: faker.datatype.number({ min: 0, max: 500 }),
        copay: faker.datatype.number({ min: 0, max: 100 }),
        coinsurance: faker.datatype.number({ min: 0, max: 200 })
      },
      diagnosis: [
        {
          code: `${faker.random.alpha({ count: 1, upcase: true })}${faker.datatype.number({ min: 10, max: 99 })}`,
          description: faker.lorem.words(3),
          isPrimary: true
        }
      ],
      procedures: [
        {
          code: faker.datatype.number({ min: 10000, max: 99999 }).toString(),
          description: faker.lorem.words(4),
          units: faker.datatype.number({ min: 1, max: 5 }),
          amount: billedAmount
        }
      ]
    };
  }

  /**
   * Generate random payment
   */
  static generatePayment(memberId?: string): Payment {
    const paymentMethods = Object.values(PaymentMethod);
    const paymentStatuses = Object.values(PaymentStatus);

    return {
      paymentId: this.generatePaymentId(),
      memberId: memberId || this.generateMemberId(),
      amount: faker.datatype.number({ min: 50, max: 1000 }),
      paymentMethod: faker.random.arrayElement(paymentMethods),
      paymentDate: faker.date.recent(30),
      dueDate: this.generateFutureDate(30),
      status: faker.random.arrayElement(paymentStatuses),
      invoiceId: `INV${faker.datatype.number({ min: 1000000, max: 9999999 })}`,
      description: faker.lorem.sentence()
    };
  }

  /**
   * Generate multiple users
   */
  static generateUsers(count: number, role?: UserRole): User[] {
    const users: User[] = [];
    const roles = role ? [role] : Object.values(UserRole);

    for (let i = 0; i < count; i++) {
      const selectedRole = role || faker.random.arrayElement(roles);
      users.push(this.generateUser(selectedRole));
    }

    return users;
  }

  /**
   * Generate multiple plans
   */
  static generatePlans(count: number): InsurancePlan[] {
    const plans: InsurancePlan[] = [];
    for (let i = 0; i < count; i++) {
      plans.push(this.generateInsurancePlan());
    }
    return plans;
  }

  /**
   * Generate multiple providers
   */
  static generateProviders(count: number): Provider[] {
    const providers: Provider[] = [];
    for (let i = 0; i < count; i++) {
      providers.push(this.generateProvider());
    }
    return providers;
  }

  /**
   * Generate multiple claims
   */
  static generateClaims(count: number, memberId?: string, providerId?: string): Claim[] {
    const claims: Claim[] = [];
    for (let i = 0; i < count; i++) {
      claims.push(this.generateClaim(memberId, providerId));
    }
    return claims;
  }

  /**
   * Generate multiple payments
   */
  static generatePayments(count: number, memberId?: string): Payment[] {
    const payments: Payment[] = [];
    for (let i = 0; i < count; i++) {
      payments.push(this.generatePayment(memberId));
    }
    return payments;
  }

  /**
   * Get permissions for role
   */
  private static getPermissionsForRole(role: UserRole): string[] {
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
   * Get department for role
   */
  private static getDepartmentForRole(role: UserRole): string {
    const departmentMap: Record<UserRole, string> = {
      [UserRole.MEMBER]: 'N/A',
      [UserRole.EMPLOYEE]: 'General',
      [UserRole.ADMINISTRATOR]: 'IT Administration',
      [UserRole.BROKER]: 'Sales',
      [UserRole.CLAIMS_PROCESSOR]: 'Claims Processing',
      [UserRole.CUSTOMER_SERVICE]: 'Customer Service',
      [UserRole.HEALTHCARE_PROVIDER]: 'Medical',
      [UserRole.FINANCE_TEAM]: 'Finance',
      [UserRole.COMPLIANCE_OFFICER]: 'Compliance'
    };

    return departmentMap[role] || 'General';
  }

  /**
   * Get title for role
   */
  private static getTitleForRole(role: UserRole): string {
    const titleMap: Record<UserRole, string> = {
      [UserRole.MEMBER]: 'Member',
      [UserRole.EMPLOYEE]: 'Employee',
      [UserRole.ADMINISTRATOR]: 'System Administrator',
      [UserRole.BROKER]: 'Insurance Broker',
      [UserRole.CLAIMS_PROCESSOR]: 'Claims Processor',
      [UserRole.CUSTOMER_SERVICE]: 'Customer Service Representative',
      [UserRole.HEALTHCARE_PROVIDER]: 'Healthcare Provider',
      [UserRole.FINANCE_TEAM]: 'Financial Analyst',
      [UserRole.COMPLIANCE_OFFICER]: 'Compliance Officer'
    };

    return titleMap[role] || 'Employee';
  }

  /**
   * Generate test scenario data
   */
  static generateScenarioData(scenarioName: string): any {
    switch (scenarioName) {
      case 'member_enrollment':
        return {
          member: this.generateUser(UserRole.MEMBER),
          plan: this.generateInsurancePlan(),
          effectiveDate: this.generateFutureDate(30)
        };

      case 'claim_submission':
        return {
          member: this.generateUser(UserRole.MEMBER),
          provider: this.generateProvider(),
          claim: this.generateClaim()
        };

      case 'payment_processing':
        return {
          member: this.generateUser(UserRole.MEMBER),
          payment: this.generatePayment()
        };

      case 'eligibility_verification':
        return {
          member: this.generateUser(UserRole.MEMBER),
          provider: this.generateProvider(),
          serviceDate: this.generateFutureDate(7)
        };

      default:
        return {};
    }
  }

  /**
   * Generate realistic healthcare amounts
   */
  static generateHealthcareAmounts() {
    const procedures = [
      { name: 'Office Visit', min: 150, max: 300 },
      { name: 'Lab Work', min: 50, max: 200 },
      { name: 'X-Ray', min: 100, max: 400 },
      { name: 'MRI', min: 1000, max: 3000 },
      { name: 'Surgery', min: 5000, max: 50000 },
      { name: 'Emergency Room', min: 500, max: 5000 }
    ];

    const procedure = faker.random.arrayElement(procedures);
    return faker.datatype.number({ min: procedure.min, max: procedure.max });
  }

  /**
   * Generate realistic diagnosis codes
   */
  static generateDiagnosisCodes(): string[] {
    const commonCodes = [
      'Z00.00', 'I10', 'E11.9', 'M79.3', 'K21.9',
      'F32.9', 'J06.9', 'R50.9', 'N39.0', 'M25.50'
    ];

    return faker.random.arrayElements(commonCodes, faker.datatype.number({ min: 1, max: 3 }));
  }

  /**
   * Generate realistic procedure codes
   */
  static generateProcedureCodes(): string[] {
    const commonCodes = [
      '99213', '99214', '99215', '80053', '85025',
      '73060', '70553', '64483', '29881', '43239'
    ];

    return faker.random.arrayElements(commonCodes, faker.datatype.number({ min: 1, max: 2 }));
  }
}