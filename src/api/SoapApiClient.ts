import * as soap from 'soap';
import { parseString } from 'xml2js';
import { getCurrentEnvironment } from '@/config/environments';
import { ApiResponse, ApiError } from '@/types/healthcare.types';

export interface SoapClientOptions {
  endpoint?: string;
  wsdl?: string;
  username?: string;
  password?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface SoapSecurityOptions {
  username: string;
  password: string;
  passwordType?: 'PasswordText' | 'PasswordDigest';
  hasTimeStamp?: boolean;
  hasTokenCreated?: boolean;
  hasNonce?: boolean;
}

export class SoapApiClient {
  private client: any = null;
  private endpoint: string;
  private wsdl: string;
  private options: SoapClientOptions;

  constructor(options: SoapClientOptions = {}) {
    const environment = getCurrentEnvironment();
    
    this.endpoint = options.endpoint || environment.soapBaseUrl;
    this.wsdl = options.wsdl || `${this.endpoint}?wsdl`;
    this.options = {
      timeout: 30000,
      headers: {
        'User-Agent': 'UHC-GPS-Automation-Framework/1.0',
        'Content-Type': 'text/xml; charset=utf-8'
      },
      ...options
    };
  }

  /**
   * Initialize SOAP client
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[SOAP Client] Initializing client with WSDL: ${this.wsdl}`);
      
      this.client = await soap.createClientAsync(this.wsdl, {
        endpoint: this.endpoint,
        timeout: this.options.timeout,
        headers: this.options.headers
      });

      // Set up security if credentials provided
      if (this.options.username && this.options.password) {
        this.setSecurity({
          username: this.options.username,
          password: this.options.password
        });
      }

      console.log('[SOAP Client] Successfully initialized');
    } catch (error) {
      console.error('[SOAP Client] Initialization failed:', error);
      throw new Error(`SOAP client initialization failed: ${error}`);
    }
  }

  /**
   * Set WS-Security credentials
   */
  setSecurity(securityOptions: SoapSecurityOptions): void {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    const security = new soap.WSSecurity(
      securityOptions.username,
      securityOptions.password,
      {
        passwordType: securityOptions.passwordType || 'PasswordText',
        hasTimeStamp: securityOptions.hasTimeStamp !== false,
        hasTokenCreated: securityOptions.hasTokenCreated !== false,
        hasNonce: securityOptions.hasNonce !== false
      }
    );

    this.client.setSecurity(security);
    console.log('[SOAP Client] Security credentials set');
  }

  /**
   * Set custom HTTP headers
   */
  setHeaders(headers: Record<string, string>): void {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    this.client.addHttpHeader(headers);
    console.log('[SOAP Client] Custom headers set');
  }

  /**
   * Get WSDL description
   */
  getWsdlDescription(): string {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    return this.client.describe();
  }

  /**
   * List available services
   */
  getServices(): string[] {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    const description = this.client.describe();
    return Object.keys(description);
  }

  /**
   * List available methods for a service
   */
  getServiceMethods(serviceName: string): string[] {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    const description = this.client.describe();
    const service = description[serviceName];
    
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    const ports = Object.keys(service);
    const methods: string[] = [];
    
    ports.forEach(port => {
      const portMethods = Object.keys(service[port]);
      methods.push(...portMethods);
    });

    return [...new Set(methods)]; // Remove duplicates
  }

  /**
   * Call SOAP method
   */
  async callMethod<T>(methodName: string, parameters: any = {}): Promise<ApiResponse<T>> {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    
    try {
      console.log(`[SOAP Request] Calling method: ${methodName}`);
      console.log(`[SOAP Request] Parameters:`, JSON.stringify(parameters, null, 2));

      const result = await new Promise((resolve, reject) => {
        this.client[methodName](parameters, (err: any, result: any, rawResponse: string, soapHeader: any, rawRequest: string) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              result,
              rawResponse,
              soapHeader,
              rawRequest
            });
          }
        });
      });

      const duration = Date.now() - startTime;
      console.log(`[SOAP Response] Method ${methodName} completed (${duration}ms)`);

      return this.formatResponse(result as any);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[SOAP Error] Method ${methodName} failed (${duration}ms):`, error);
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Healthcare-specific methods
   */

  /**
   * Verify member eligibility
   */
  async verifyEligibility(memberId: string, providerId: string, serviceDate: string): Promise<ApiResponse<any>> {
    const parameters = {
      MemberID: memberId,
      ProviderID: providerId,
      ServiceDate: serviceDate,
      ServiceType: 'Medical'
    };

    return await this.callMethod('VerifyEligibility', parameters);
  }

  /**
   * Submit claim
   */
  async submitClaim(claimData: any): Promise<ApiResponse<any>> {
    const parameters = {
      ClaimData: claimData
    };

    return await this.callMethod('SubmitClaim', parameters);
  }

  /**
   * Get claim status
   */
  async getClaimStatus(claimId: string): Promise<ApiResponse<any>> {
    const parameters = {
      ClaimID: claimId
    };

    return await this.callMethod('GetClaimStatus', parameters);
  }

  /**
   * Get member information
   */
  async getMemberInfo(memberId: string): Promise<ApiResponse<any>> {
    const parameters = {
      MemberID: memberId
    };

    return await this.callMethod('GetMemberInfo', parameters);
  }

  /**
   * Get provider information
   */
  async getProviderInfo(providerId: string): Promise<ApiResponse<any>> {
    const parameters = {
      ProviderID: providerId
    };

    return await this.callMethod('GetProviderInfo', parameters);
  }

  /**
   * Process payment
   */
  async processPayment(paymentData: any): Promise<ApiResponse<any>> {
    const parameters = {
      PaymentData: paymentData
    };

    return await this.callMethod('ProcessPayment', parameters);
  }

  /**
   * Get benefit information
   */
  async getBenefitInfo(memberId: string, planId: string): Promise<ApiResponse<any>> {
    const parameters = {
      MemberID: memberId,
      PlanID: planId
    };

    return await this.callMethod('GetBenefitInfo', parameters);
  }

  /**
   * Validate provider credentials
   */
  async validateProvider(providerId: string, npi: string): Promise<ApiResponse<any>> {
    const parameters = {
      ProviderID: providerId,
      NPI: npi
    };

    return await this.callMethod('ValidateProvider', parameters);
  }

  /**
   * Get authorization status
   */
  async getAuthorizationStatus(authorizationId: string): Promise<ApiResponse<any>> {
    const parameters = {
      AuthorizationID: authorizationId
    };

    return await this.callMethod('GetAuthorizationStatus', parameters);
  }

  /**
   * Submit prior authorization request
   */
  async submitPriorAuth(authData: any): Promise<ApiResponse<any>> {
    const parameters = {
      AuthorizationData: authData
    };

    return await this.callMethod('SubmitPriorAuth', parameters);
  }

  /**
   * Parse XML response to JSON
   */
  async parseXmlResponse(xmlString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xmlString, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Format successful response
   */
  private formatResponse<T>(response: any): ApiResponse<T> {
    return {
      success: true,
      data: response.result,
      timestamp: new Date(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse<T>(error: any): ApiResponse<T> {
    const apiError: ApiError = {
      code: error.code || 'SOAP_ERROR',
      message: error.message || 'SOAP operation failed',
      details: {
        fault: error.body || error.fault || {},
        statusCode: error.statusCode
      }
    };

    return {
      success: false,
      error: apiError,
      timestamp: new Date(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `soap_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get last request XML
   */
  getLastRequest(): string {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    return this.client.lastRequest || '';
  }

  /**
   * Get last response XML
   */
  getLastResponse(): string {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    return this.client.lastResponse || '';
  }

  /**
   * Set endpoint URL
   */
  setEndpoint(endpoint: string): void {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    this.client.setEndpoint(endpoint);
    this.endpoint = endpoint;
    console.log(`[SOAP Client] Endpoint set to: ${endpoint}`);
  }

  /**
   * Clear security
   */
  clearSecurity(): void {
    if (!this.client) {
      throw new Error('SOAP client not initialized. Call initialize() first.');
    }

    this.client.clearSecurity();
    console.log('[SOAP Client] Security cleared');
  }

  /**
   * Close client connection
   */
  close(): void {
    if (this.client) {
      this.client = null;
      console.log('[SOAP Client] Connection closed');
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get client endpoint
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Get WSDL URL
   */
  getWsdlUrl(): string {
    return this.wsdl;
  }
}

// Export singleton instance
export const soapClient = new SoapApiClient();