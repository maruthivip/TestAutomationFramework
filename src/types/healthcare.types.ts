// User Role Types
export enum UserRole {
  MEMBER = 'member',
  EMPLOYEE = 'employee',
  ADMINISTRATOR = 'administrator',
  BROKER = 'broker',
  CLAIMS_PROCESSOR = 'claims_processor',
  CUSTOMER_SERVICE = 'customer_service',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  FINANCE_TEAM = 'finance_team',
  COMPLIANCE_OFFICER = 'compliance_officer'
}

// User Interface
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  memberId?: string;
  employeeId?: string;
  providerId?: string;
  brokerId?: string;
  department?: string;
  title?: string;
  phone?: string;
  address?: Address;
}

// Address Interface
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Insurance Plan Types
export interface InsurancePlan {
  planId: string;
  planName: string;
  planType: PlanType;
  coverage: Coverage;
  premiums: Premium;
  deductibles: Deductible;
  copays: Copay;
  outOfPocketMax: number;
  networkProviders: Provider[];
  effectiveDate: Date;
  expirationDate: Date;
  isActive: boolean;
}

export enum PlanType {
  HMO = 'HMO',
  PPO = 'PPO',
  EPO = 'EPO',
  POS = 'POS',
  HDHP = 'HDHP'
}

export interface Coverage {
  medical: boolean;
  dental: boolean;
  vision: boolean;
  prescription: boolean;
  mentalHealth: boolean;
  preventiveCare: boolean;
}

export interface Premium {
  individual: number;
  family: number;
  employeeContribution: number;
  employerContribution: number;
}

export interface Deductible {
  individual: number;
  family: number;
  inNetwork: number;
  outOfNetwork: number;
}

export interface Copay {
  primaryCare: number;
  specialist: number;
  urgentCare: number;
  emergencyRoom: number;
  prescription: {
    generic: number;
    brandName: number;
    specialty: number;
  };
}

// Provider Types
export interface Provider {
  providerId: string;
  npi: string;
  name: string;
  specialty: string;
  address: Address;
  phone: string;
  isInNetwork: boolean;
  acceptingNewPatients: boolean;
}

// Claims Types
export interface Claim {
  claimId: string;
  memberId: string;
  providerId: string;
  serviceDate: Date;
  submissionDate: Date;
  status: ClaimStatus;
  amount: ClaimAmount;
  diagnosis: Diagnosis[];
  procedures: Procedure[];
  adjudication?: Adjudication;
}

export enum ClaimStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  PARTIALLY_APPROVED = 'partially_approved',
  UNDER_REVIEW = 'under_review'
}

export interface ClaimAmount {
  billed: number;
  allowed: number;
  paid: number;
  memberResponsibility: number;
  deductible: number;
  copay: number;
  coinsurance: number;
}

export interface Diagnosis {
  code: string;
  description: string;
  isPrimary: boolean;
}

export interface Procedure {
  code: string;
  description: string;
  modifier?: string;
  units: number;
  amount: number;
}

export interface Adjudication {
  processedDate: Date;
  processedBy: string;
  reasonCodes: string[];
  notes?: string;
}

// Eligibility Types
export interface EligibilityRequest {
  memberId: string;
  providerId: string;
  serviceDate: Date;
  serviceType: string;
}

export interface EligibilityResponse {
  isEligible: boolean;
  effectiveDate: Date;
  terminationDate?: Date;
  benefits: Benefit[];
  limitations?: Limitation[];
  exclusions?: Exclusion[];
}

export interface Benefit {
  serviceType: string;
  coverage: string;
  deductible: number;
  copay: number;
  coinsurance: number;
  outOfPocketMax: number;
  remainingDeductible: number;
  remainingOutOfPocket: number;
}

export interface Limitation {
  serviceType: string;
  description: string;
  maxVisits?: number;
  maxAmount?: number;
  timePeriod?: string;
}

export interface Exclusion {
  serviceType: string;
  description: string;
  reason: string;
}

// Payment Types
export interface Payment {
  paymentId: string;
  memberId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  dueDate: Date;
  status: PaymentStatus;
  invoiceId: string;
  description: string;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Test Data Types
export interface TestData {
  users: User[];
  plans: InsurancePlan[];
  providers: Provider[];
  claims: Claim[];
  payments: Payment[];
}

// Authentication Types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
}

// Database Types
export interface CosmosDbConfig {
  endpoint: string;
  key: string;
  database: string;
  container: string;
}

export interface OracleDbConfig {
  host: string;
  port: number;
  service: string;
  username: string;
  password: string;
}

// Test Configuration Types
export interface TestConfig {
  environment: string;
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  parallel: boolean;
  headless: boolean;
  screenshot: boolean;
  video: boolean;
  trace: boolean;
}

// Page Object Types
export interface PageElement {
  selector: string;
  description: string;
  timeout?: number;
}

export interface PageElements {
  [key: string]: PageElement;
}

// Test Result Types
export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  logs?: string[];
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

// Accessibility Types
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityNode {
  html: string;
  target: string[];
  failureSummary: string;
}

// Security Types
export interface SecurityTestResult {
  testType: string;
  passed: boolean;
  vulnerabilities: SecurityVulnerability[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}